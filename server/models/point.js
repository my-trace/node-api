const Promise = require('bluebird')
const _ = require('lodash')

class Point {
  constructor() {}
}

Point.bulkInsert = Promise.coroutine(function* (knex, points) {
  const flatPoints = _.flatMap(points, p =>
    [ p.id, p.lat, p.lng, p.alt, p.floor_level, p.vertical_accuracy, p.horizontal_accuracy, p.account_id, new Date(p.created_at).toISOString() ]
  )
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

