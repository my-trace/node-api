const env = require('../../env')

const User = require('../models/user')

// ask facebook if the token they gave us is valid
exports.auth = function* (next) {
  const token = this.get('Authorization')
  if (!token) {
    this.status = 401
    return this.body = 'unauthorized'
  }
  const request = this.app.context.request
  const options = {
    url: 'https://graph.facebook.com/debug_token?',
    json: true,
    qs: {
      input_token: token,
      access_token: env.FB_APP_KEY + '|' + env.FB_APP_SECRET
    }
  }
  const reply = yield request(options)
  if (reply.data.is_valid) {
    const knex = this.app.context.db
    this.facebookId = parseInt(reply.data.user_id)
    this.userId = (yield User.findByFacebook(knex, this.facebookId)).id
    yield next
  } else {
    this.throw(400, reply.data.error.message)
  }
}

// sign in via oauth to create a user in postgres
exports.getUser = function* (next) {
  const token = this.query.access_token
  const request = this.app.context.request
  const options = {
    url: 'https://graph.facebook.com/me',
    json: true,
    qs: {
      fields: 'id,name,email'
    },
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  const reply = yield request(options)
  reply.facebook_id = reply.id
  delete reply.id
  this.user = reply
  this.token = token
  yield next
}

