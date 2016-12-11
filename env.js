const envalid = require('envalid')
const { num, url, str } = envalid

const env = envalid.cleanEnv(process.env, {
  PORT: num({ default: 3333 }),
  PG_URL: url(),
  FB_APP_KEY: str(),
  FB_APP_SECRET: str(),
  HOST: str(),
})

module.exports = env
