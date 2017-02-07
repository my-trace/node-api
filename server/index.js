const koa = require('koa')
const cors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const mount = require('koa-mount')
const session = require('koa-session')
const Grant = require('grant-koa')

const env = require('../env')
const userCtrl = require('./controllers/user')
const pointCtrl = require('./controllers/point')
const placesCtrl = require('./controllers/place')
const facebook = require('./services/facebook')

function start() {
  const app = koa()
  // for encrypting the cookie. the cookie isn't acutally used for anything right now
  app.keys = [ env.SESSION_KEY ]

  app.use(errorHandler)
  app.use(session(app))
  app.use(cors())
  app.use(bodyParser({ jsonLimit: '50mb' }))

  // a super easy oauth client
  const grant = new Grant({
    server: {
      protocol: 'http',
      host: env.HOST
    },
    facebook: {
      key: env.FB_APP_KEY,
      secret: env.FB_APP_SECRET,
      scope: [ 'public_profile', 'user_friends', 'email' ],
      callback: '/facebook/callback'
    }
  })

  app.use(mount(grant))

  // a simple health check route
  router.get('/health', function() {
    this.body = 'healthy'
  })

  router.get('/facebook/callback', facebook.getUser, userCtrl.createFromOAuth)

  router.post('/users', userCtrl.create)

  router.get('/points', facebook.auth, pointCtrl.index)
  router.post('/points', facebook.auth, pointCtrl.create)

  router.get('/places', placesCtrl.index)

  app.use(router.routes())
  app.use(router.allowedMethods())
  
  return app
}

// global error handler
function* errorHandler(next) {
  try {
    yield next
  } catch (err) {
    this.status = err.status || 500
    this.body = err.message
    this.app.emit('error', err, this)
  }
}

// similar to the if __name__ == '__main__' idiom in python
// if this is the main module, run the server with the real context and bind to a port
// otherwise we are importing the module somewhere, probably for tests. so we want to stub out things like the database, request library, or the time
if (!module.parent) {
  const knex = require('knex')({
    client: 'pg',
    connection: env.PG_URL
  })
  const app = start()
  app.context.db = knex
  app.context.request = require('request-promise')
  app.context.now = Date.now
  app.context.logger = require('./util/logger')
  app.listen(env.PORT, () => console.log(`listening at http://localhost:${env.PORT}`))
}

module.exports = start

