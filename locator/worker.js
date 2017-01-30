const Promise = require('bluebird')
const moment = require('moment')
const { curry, chain, map } = require('lodash')

const env = require('../env')
const Cluster = require('./Cluster')
const reverseGeocode = require('./reverse-geocode')

// they hyperparameters we'll need to tune
const EPSILON = 0.00003
const DURATION_LIMIT = 500000

const checkUsers = Promise.coroutine(function* (knex, date) {
  // get a list of all the users
  // omg ALL of them? yes all of them. deal with it
  const users = yield knex('accounts')
    .select('id', 'checked_at', 'name')
    .where('checked_at', '<', date)
    .orWhere('checked_at', null)

  // run the clusterPoints function for each. have 8 running concurrently
  yield Promise.map(users, clusterPoints(knex, date), { concurrency: 8 })
})

const clusterPoints = curry(Promise.coroutine(function* (knex, date, user) {
  // determine where to start the window of points
  let start
  // maybe we've never checked this user before
  if (!user.checked_at) {
    const { created_at: firstPoint } = yield knex('points')
      .first('created_at')
      .where('account_id', user.id)
      .orderBy('created_at')
      .limit(1)
    // if they have no points, there is no work to be done for this user
    if (!firstPoint) return 
    // if there are, start at their first point
    start = moment(firstPoint)
  } else {
    // poick up where we left off last time
    start = moment(user.checked_at)
  }


  // the end date should be one day after the start, unless one day later is in the future...
  let end = moment(start).add(1, 'd')
  end = moment(Math.min(end, date))
  let points = yield knex('points')
    .select('lat', 'lng', 'created_at')
    .where('account_id', user.id)
    .whereBetween('created_at', [ start, end ])
    .orderBy('created_at')

  console.log(`running for user ${user.name} from ${start} to ${end}`)

  if (points.length) {
    // cast those stringy numerics to JavaScript numbers
    points.forEach(points => {
      points.lat = parseFloat(points.lat)
      points.lng = parseFloat(points.lng)
    })

    // this is the secret sauce. the sauce tastes like shit
    // EPSILON is an arbitrary radius within which new points are considered "within the boundary of the cluster"
    // its a distance from the center of the cluster. we'll need to play with it
    let clusters = [ new Cluster(EPSILON, points.shift()) ]
    for (let point of points) {
      const lastCluster = clusters[clusters.length - 1]
      // add the points into the last cluster if it is near enough
      if (lastCluster.contains(point)) {
        lastCluster.push(point)
      // otherwise, start a new cluster
      } else {
        clusters.push(new Cluster(EPSILON, point))
      }
    }

    // remove clusters of 1
    clusters = clusters.filter(cluster => cluster.points.length > 1)
    // remove anything if they weren't there for long enough
    // DURATION_LIMIT is another arbitrary hyperparameter to play with
    clusters = clusters.filter(cluster => cluster.duration > DURATION_LIMIT)

    // call the Google places API
    let places = yield Promise.map(clusters, cluster => {
      const center = cluster.center()
      return reverseGeocode(center.lat, center.lng)
    })

    // sometimes we get no results from the API, soo there are some nulls in here. lets remove those from the array
    // along with the cluster of points for which the API call was made
    for (let i = places.length - 1; i >= 0; i--) {
      if (!places[i]) {
        places.splice(i, 1)
        clusters.splice(i, 1)
      }
    }

    // the cross linking table rows
    const links = places.map((place, i) => {
      return {
        account_id: user.id,
        place_id: place.id,
        duration: clusters[i].duration,
        started_at: clusters[i].startedAt()
      }
    })

    // first get only the unique places, then map to the table rows
    let uniqPlaces = chain(places).uniqBy('id').map(place => ({
      id: place.id,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      icon: place.icon,
      name: place.name,
      place_id: place.place_id,
      types: JSON.stringify(place.types)
    })).value()

    console.log(`user ${user.name} was at \n${map(uniqPlaces, 'name').join(',\n')}`)

    // see if DB already contains any of these places
    const placeIds = map(uniqPlaces, 'id')
    let existingPlaces = yield knex('places').select('id').whereIn('id', placeIds)
    existingPlaces = new Set(map(existingPlaces, 'id'))
    // if so, filter out those duplicates
    uniqPlaces = uniqPlaces.filter(place => !existingPlaces.has(place.id))

    yield knex.batchInsert('places', uniqPlaces)
    yield knex.batchInsert('accounts_places_links', links)
  }

  // update the user that we've checked their points up to `end`
  yield knex('accounts').where('id', user.id).update({ checked_at: end })
  user.checked_at = end

  // we just checked one day's worth of points
  // if we need to check the next day, recurse.
  if (end < moment().subtract(1, 'day')) {
    return clusterPoints(knex, date, user)
  }
}), 3)

module.exports = checkUsers

// just kick it off in this file.
// eventually this will be scheduled daily
if (!module.parent) {
  const knex = require('knex')({
    client: 'pg',
    connection: env.PG_URL
  })
  checkUsers(knex, new Date)
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
}
