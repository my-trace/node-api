const schedule = require('node-schedule')
const env = require('../env')
const checkUsers = require('./worker')

const knex = require('knex')({
  client: 'pg',
  connection: env.PG_URL
})

// run every morning at 5am
schedule.scheduleJob('0 5 * * *', () => {
  checkUsers(knex, new Date)
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
})
