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
      'error': err,
    })
    this.status = 400
  }
}

// for react native
exports.createRN = function* () {
  const knex = this.app.context.db
  const logger = this.app.context.logger
  this.user_id = null
  logger.info({
    'method': 'controllers.point.create',
    'msg': 'saving point',
    'user_id': this.userId,
    'created_at': this.request.body.location.timestamp,
  })

  let points = this.request.body.location.map(mapRNPointToIOS)
  this.userId = 'c2e07d98-a6c3-4ac5-a515-4c7145b29f38'
  try {
    yield Point.bulkInsert(knex, points, this.userId, this)
    logger.info({
      'method': 'controllers.point.create',
      'msg': 'successfully saved points',
      'user_id': this.userId,
    })
    this.status = 301 // change to 200 later  
  } catch (err) {
    logger.error({
      'method': 'controllers.point.create',
      'msg': 'error saving points',
      'user_id': this.userId,
      'error': err,
    })

    this.status = 400
  }
}

// use for mapping points generate on reaact native app to ios so that bulk insert code can be used
function mapRNPointToIOS(location) {
  return {
    uuid: location.uuid,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude,
    floorLevel: null,
    verticalAccuracy: location.coords.altitude_accuracy,
    horizontalAccuracy: location.coords.accuracy,
    timestamp: Date.parse(location.timestamp), // needs to be in ms
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

