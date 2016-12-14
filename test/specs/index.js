const test = require('ava')
const { createTestDB, dropTestDB } = require('../utils/database')
const start = require('../../server/index')
const agent = require('supertest-koa-agent')
const reqStub = require('../stubs/request')


test.beforeEach(function* (t) {
  t.context = yield createTestDB()
  const app = t.context.app = start()
  app.context.now = () => 1481188482437
  app.context.db = t.context.knex
  mock('./../../server/util/logger', { info: function() {
    console.log('http.request called');
  }});
})

test.always.afterEach(function* (t) {
  yield dropTestDB(t.context)
})

test('health check', function* (t) {
  const res = yield agent(t.context.app)
    .get('/health')
    .expect(200)
  t.is(res.text, 'healthy')
})

test('GET /facebook/callback should register a new user', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const res = yield agent(app)
    .get('/facebook/callback?access_token=johnToken')
    .expect(200)
  t.truthy(res.text)
  t.is(JSON.parse(res.text).name, 'John Doe')
  const newUser = yield t.context.knex('accounts').first().where({ name: 'John Doe' })
  t.is(newUser.facebook_id, '1119072518111933')
})

test('GET /facebook/callback should not duplicate an existing user', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const res = yield agent(app)
    .get('/facebook/callback?access_token=andyToken')
    .expect(200)
  t.truthy(res.text)
  t.is(JSON.parse(res.text).name, 'Andy Carlson')
  const andys = yield t.context.knex('accounts').select().where({ name: 'Andy Carlson' })
  t.is(andys.length, 1)
  t.is(andys[0].facebook_id, '1119072518111932')
})

test('POST /users registers a new user', function* (t) {
  const app = t.context.app
  yield agent(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send({ name: 'Alex Zai', email: 'azai91@gmail.com', facebook_id: '1119072518111931' })
    .expect(201)
  const alex = yield t.context.knex('accounts').first().where({ name: 'Alex Zai' })
  t.truthy(alex)
  t.is(alex.email, 'azai91@gmail.com')
})

test('POST /users does not duplicate an email', function* (t) {
  const app = t.context.app
  yield agent(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send({ name: 'Andy Carlson', email: '2yinyang2@gmail.com', facebook_id: '1119072518111932' })
    .expect(201)
})

test('POST /users rejects an improper email', function* (t) {
  const app = t.context.app
  yield agent(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send({ name: 'Andy Carlson', email: '2yinyang2', facebook_id: '1119072518111932' })
    // TODO make this a 400 error
    .expect(400)
})

test('POST /points creates points for a user', function* (t) {
  const currentPoints = yield t.context.knex('points').select().where('account_id', '18a91a83-904f-4aa1-949d-d9d01010de33')
  t.is(currentPoints.length, 4)
  const app = t.context.app
  app.context.request = reqStub
  const newPoints = [
    // this point is a duplicate, should not get saved
    {
      uuid: 'e54bc9e0-bd06-11e6-bb4d-0f490bb3511f',
      latitude: 34.6507534,
      longitude: -118.1868112,
      altitude: 20.8975256703,
      timestamp: '2016-12-08 04:44:08.915539'
    },
    // but this one is new
    {
      uuid: 'fabc304a-bd14-11e6-ab3e-3b9300e9a1b8',
      latitude: 34.0753423,
      longitude: -118.6811210,
      altitude: 20.7525670344,
      timestamp: '2016-12-08 04:44:08.915539'
    }
  ]
  yield agent(app)
    .post('/points')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'andyToken')
    .send(newPoints)
    .expect(201)
  const andyPoints = yield t.context.knex('points').select().where('account_id', '18a91a83-904f-4aa1-949d-d9d01010de33')
  t.is(andyPoints.length, 5)
})

test('POST /points requires a recent date', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const newPoints = [
    {
      uuid: 'e54bc9e0-bd06-11e6-bb4d-0f490bb3511f',
      latitude: 34.6507534,
      longitude: -118.1868112,
      altitude: 20.8975256703,
      timestamp: '1980-12-08 04:44:08.915539'
    }
  ]
  yield agent(app)
    .post('/points')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'andyToken')
    .send(newPoints)
    .expect(400)
})

test('GET /points should default to last week of any points', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const res = yield agent(app)
    .get('/points')
    .set('Authorization', 'andyToken')
    .expect(200)
  t.truthy(res.text)
  t.is(JSON.parse(res.text).length, 3)
})

test('GET /points should not work without auth', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  yield agent(app)
    .get('/points')
    .expect(401)
})

test('GET /points should accept "from" query', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const from = new Date('2016-12-08 04:44:09.915539Z').valueOf()
  const res = yield agent(app)
    .get(`/points?from=${from}`)
    .set('Authorization', 'andyToken')
    .expect(200)
  t.truthy(res.text)
  t.is(JSON.parse(res.text).length, 2)
})

test('GET /points should accept "until" query', function* (t) {
  const app = t.context.app
  app.context.request = reqStub
  const until = new Date('2016-12-08 04:44:10.115539Z').valueOf()
  const res = yield agent(app)
    .get(`/points?until=${until}`)
    .set('Authorization', 'andyToken')
    .expect(200)
  t.truthy(res.text)
  t.is(JSON.parse(res.text).length, 2)
})

