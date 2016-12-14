const winston = require('winston')

require('winston-papertrail').Papertrail

const winstonPapertrail = new winston.transports.Papertrail({
  host: 'logs3.papertrailapp.com',
  port: 20251,
  colorize: true,
})

const consoleLogger = new winston.transports.Console({
  timestamp: function() {
    return new Date().toString()
  },
  colorize: true
})

const transports = [consoleLogger]

if (process.env.NODE_ENV == 'production') {
  transports.push(winstonPapertrail)
}

const logger = new winston.Logger({
  transports: transports
})


module.exports = logger