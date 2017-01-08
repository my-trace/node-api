const assert = require('assert')
const Promise = require('bluebird')
const moment = require('moment')
const { curry } = require('lodash')

const env = require('../env')
const Cluster = require('./Cluster')
const reverseGeocode = require('./reverse-geocode')

const getUsers = Promise.coroutine(function* (knex, date) {
  const users = yield knex('accounts')
    .select('id', 'checked_at', 'name')
    .where('checked_at', '<', date)
    .orWhere('checked_at', null)

  yield Promise.map(users.filter(u => u.name === 'Andy Carlson'), clusterPoints(knex, date), { concurrency: 8 })
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

  assert(points.length, 'must not be 0 points')
  // cast those stringy numerics to JavaScript numbers
  points.forEach(points => {
    points.lat = parseFloat(points.lat)
    points.lng = parseFloat(points.lng)
  })

  let clusters = [ new Cluster(env.EPSILON, points.shift()) ]
  for (let point of points) {
    const lastCluster = clusters[clusters.length - 1]
    if (lastCluster.contains(point)) {
      lastCluster.push(point)
    } else {
      clusters.push(new Cluster(env.EPSILON, point))
    }
  }

  // remove clusters of 1
  clusters = clusters.filter(cluster => cluster.points.length > 1)
  clusters = clusters.filter(cluster => cluster.duration > 500000)

  let places = yield Promise.map(clusters, cluster => {
    const center = cluster.center()
    return reverseGeocode(center.lat, center.lng)
  })

  places = places.map(place => ({
    id: place.id,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    icon: place.icon,
    name: place.name,
    place_id: place.place_id,
    types: JSON.stringify(place.types)
  }))
  console.log(places)

  yield knex.batchInsert('places', places)

  const links = places.map((place, i) => ({
    account_id: user.id,
    place_id: place.id,
    duration: clusters[i].duration,
    startedAt: clusters[i].startedAt()
  }))

  yield knex.batchInsert('accounts_places_links', links)
}), 3)

if (!module.parent) {
  const knex = require('knex')({
    client: 'pg',
    connection: env.PG_URL
  })
  getUsers(knex, new Date)
  .catch(err => {
    throw err
  })
}
