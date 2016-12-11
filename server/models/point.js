const Promise = require('bluebird')
const _ = require('lodash')

class Point {
  constructor() {}
}

// get all the points in a certain interval
Point.bulkGet = function(knex, account_id, lower, upper) {
  lower = new Date(lower).toISOString()
  upper = new Date(upper).toISOString()
  return knex('points').select().where({ account_id }).whereBetween('created_at', [ lower, upper ])
}

// insert a bunch of points
Point.bulkInsert = Promise.coroutine(function* (knex, points, userId, ctx) {
  // make it one big, flat array so that the knex library can interpolate the values. it expects an array
  const flatPoints = _.flatMap(points, p => {
    const createdAt = new Date(p.timestamp)
    if (createdAt < new Date('2015-01-01')) {
      ctx.throw(400, 'this date is before the year 2015: ' + p.created_at)
    }
    // maps client side variables to server side
    return [
      p.uuid,
      p.latitude,
      p.longitude,
      p.altitude,
      p.floorLevel,
      p.verticalAccuracy,
      p.horizontalAccuracy,
      userId,
      createdAt.toISOString()
    ]
  })
  .map(d => d || null)

  // build up the parameter string
  let tuple = Array(9).fill('?')
  // these things need type conversions
  tuple[0] = tuple[7] = '?::uuid'
  tuple[1] = tuple[2] = tuple[3] = tuple[5] = tuple[6] = '?::numeric'
  tuple[4] = '?::int'
  tuple[8] = '?::timestamp'
  tuple = '(' + tuple.join(', ') + ')'
  const table = Array(points.length).fill(tuple).join(',\n')

  // this query will remove duplicates (both within the new points and between the new and old points)
  // only inserting points where the IDs do not already exist in the DB
  yield knex.raw(`
    INSERT INTO points (id, lat, lng, alt, floor_level, vertical_accuracy, horizontal_accuracy, account_id, created_at)
    SELECT DISTINCT ON (id)
      p.id, p.lat, p.lng, p.alt, p.floor_level, p.vertical_accuracy, p.horizontal_accuracy, p.account_id, p.created_at
    FROM (
      VALUES
      ${table}
    ) p (id, lat, lng, alt, floor_level, vertical_accuracy, horizontal_accuracy, account_id, created_at)
    LEFT JOIN points AS old
    ON old.id = p.id
    WHERE old.id IS NULL
  `, flatPoints)
})

module.exports = Point

