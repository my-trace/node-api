const uuid = require('uuid')

class User {
  constructor(props, ctx) {
    if (!props.email) {
      ctx.throw(400, 'email is required')
    }
    const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegExp.test(props.email)) {
      ctx.throw(400, props.email + ' is invalid format')
    }
    this.id = uuid.v4()
    this.name = props.name
    this.email = props.email
    this.facebook_id = props.facebook_id || props.facebookId
  }
}

User.findByEmail = function(knex, email) {
  return knex('accounts').first().where({ email })
}

User.findByFacebook = function(knex, facebook_id) {
  return knex('accounts').first().where({ facebook_id })
}

User.create = function(knex, user) {
  return knex('accounts').insert(user)
}

module.exports = User

