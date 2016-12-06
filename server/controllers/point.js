const Promise = require('bluebird')
const Point = require('../models/point')

exports.create = Promise.coroutine(function* (req, res) {
  yield Point.bulkInsert(this.get('db'), req.body)
  res.status(201)
  res.end()
})

exports.index = Promise.coroutine(function* (req, res) {

})

