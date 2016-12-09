const envalid = require('envalid')
const { num, url, str } = envalid

const env = envalid.cleanEnv(process.env, {
  PORT: num({ default: 3333 }),
  PG_URL: url({ default: 'postgres://localhost/trace-dev'}),
  FB_APP_KEY: str({ default: '364038477099861'}),
  FB_APP_SECRET: str({ default: 'e17b94dd981ece557bae550fc0a9a7cb'}),
  HOST: str({ default: 'localhost:3333'}),
})

module.exports = env
