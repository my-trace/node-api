const env = require('../../env')
const knex = require('knex')
const uuid = require('uuid')
const url = require('url')
const path = require('path')
const { execSync } = require('child_process')

function createTestDB() {
  const controlUrl = env.PG_URL
  const parsedUrl = url.parse(controlUrl)
  const controlKnex = knex({
    client: 'pg',
    connection: controlUrl
  })

  const newDBName = 'test-' + uuid.v4()
  parsedUrl.pathname = '/' + newDBName
  const newDBUrl = parsedUrl.format()
  return controlKnex.raw(`CREATE DATABASE "${newDBName}"`)
    .then(() => {
      const dumpFile = path.join(__dirname, 'dump.sql')
      execSync(`psql ${newDBUrl} < ${dumpFile}`)
      controlKnex.destroy()
      return {
        knex: knex({
          client: 'pg',
          connection: newDBUrl
        }),
        dbUrl: newDBUrl,
        dbName: newDBName
      }
    })
}

function dropTestDB(context) {
  return context.knex.destroy()
  .then(() => {
    const controlUrl = env.PG_URL
    const controlKnex = knex({
      client: 'pg',
      connection: controlUrl
    })
    return controlKnex.raw(`DROP DATABASE "${context.dbName}"`)
  })
}

module.exports = { createTestDB, dropTestDB }

