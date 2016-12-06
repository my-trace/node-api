const envalid = require('envalid')
const { num, url } = envalid

const env = envalid.cleanEnv(process.env, {
  PORT: num({ default: 3333 }),
  PG_URL: url()
})

module.exports = env
