const Point = require('../models/point')

exports.create = function* () {
  const knex = this.app.context.db
  yield Point.bulkInsert(knex, this.request.body, this.userId, this)
  this.status = 201
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
