const User = require('../models/user')

exports.create = function* () {
  const knex = this.app.context.db
  const newUser = new User(this.request.body, this)
  const oldUser = yield User.findByFacebook(knex, newUser.facebook_id)

  if (oldUser) {
    this.status = 201
    this.body = 'user already exists'
  } else {
    yield User.create(knex, newUser)
    this.status = 201
    this.type = 'json'
    this.body = newUser
  }
}

exports.createFromOAuth = function* () {
  const newUser = new User(this.user, this)
  const knex = this.app.context.db
  const oldUser = yield User.findByEmail(knex, newUser.email)
  if (!oldUser) {
    yield User.create(knex, newUser)
  }
  newUser.token = this.token
  this.type = 'json'
  this.body = newUser
}

