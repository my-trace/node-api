const env = require('./env')

console.log(env.PG_URL)
module.exports = {
  thisone: {
    client: 'pg',
    connection: env.PG_URL
  }
}

