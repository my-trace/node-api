const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const env = require('../env')
const userCtrl = require('./controllers/user')
const pointCtrl = require('./controllers/point')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/health', (req, res) => res.write('healthy') && res.end())

app.post('/users', userCtrl.create.bind(app))

app.get('/points', pointCtrl.index.bind(app))
app.post('/points', pointCtrl.create.bind(app))

if (!module.parent) {
  const knex = require('knex')({
    client: 'pg',
    connection: env.PG_URL
  })
  app.set('db', knex)
  app.listen(env.PORT, () => console.log(`listening at http://localhost:${env.PORT}`))
}

module.exports = app

