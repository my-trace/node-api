const env = require('../env')
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs')

if (!module.parent) {
  const knex = require('knex')({
    client: 'pg',
    connection: env.PG_URL
  })
  knex.raw('DELETE FROM accounts CASCADE')
  .then(() => {
    return load(knex)
  })
  .then(() => {
    knex.destroy()
  })
}

function load(knex) {
  var normalizedPath = path.join(__dirname, '../test/fixtures')
  return Promise.map(fs.readdirSync(normalizedPath), file => {
    const table = path.basename(file, '.js')
    const filePath = path.join(normalizedPath, file)
    const data = require(filePath)
    return knex.batchInsert(table, data, 50)
  })
}

module.exports = load

