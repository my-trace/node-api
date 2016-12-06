const Promise = require('bluebird')
const User = require('../models/user')

exports.create = Promise.coroutine(function* (req, res) {
  const knex = this.get('db')
  const newUser = new User(req.body)
  const oldUser = yield knex('accounts').first().where({ email: newUser.email })
  console.log({ oldUser })
  if (oldUser) {
    res.status(400)
    return res.json({ message: 'user already exists' })
  }
  yield knex('accounts').insert(newUser)
  res.status(201)
  res.json(newUser)
})

