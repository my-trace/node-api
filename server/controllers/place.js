const Place = require('../models/place')

exports.index = function* () {
  const now = this.app.context.now
  const logger = this.app.context.logger
  logger.info({
    'method': 'controllers.place.index',
    'msg': 'fetching places',
    'user_id': this.userId,
  })
  let lower = parseInt(this.query.from) || now() - 7 * 24 * 60 * 60 * 1000 // one week ago
  let upper = parseInt(this.query.until) || now()
  if (upper < lower) {
    throw new Error('upper bound cannot be greater than lower bound')
  }
  const knex = this.app.context.db
  const points = yield Place.getByAccountId(knex, this.userId, lower, upper)
  this.type = 'json'
  this.body = points
}

