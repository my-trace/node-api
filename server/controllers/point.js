const Point = require('../models/point')
let get_timestamp_bounds = require('../../server/util/points_utils')

exports.create = function* () {
  const knex = this.app.context.db
  const logger = this.app.context.logger
  let created_at_bounds = get_timestamp_bounds(this.request.body)

  logger.info({
    'method': 'controllers.point.create',
    'msg': 'saving points',
    'user_id': this.userId,
    'starting_created_at': created_at_bounds[0],
    'ending_created_at': created_at_bounds[1],
  })
  try {
    yield Point.bulkInsert(knex, this.request.body, this.userId, this)
    logger.info({
      'method': 'controllers.point.create',
      'msg': 'successfully saved points',
      'user_id': this.userId,
    })
    this.status = 201  
  } catch (err) {
    logger.error({
      'method': 'controllers.point.create',
      'msg': 'error saving points',
      'user_id': this.userId,
    })
    this.status = 400
  }
}

exports.index = function* () {
  const now = this.app.context.now
  let lower = parseInt(this.query.from) || now() - 7 * 24 * 60 * 60 * 1000 // one week ago
  let upper = parseInt(this.query.until) || now()
  if (upper < lower) {
    throw new Error('upper bound cannot be greater than lower bound')
  }
  const knex = this.app.context.db
  const points = yield Point.bulkGet(knex, this.userId, lower, upper)
  this.type = 'json'
  this.body = points
}

