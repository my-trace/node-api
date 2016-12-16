const winston = require('winston')
const env = require('../../env')

require('winston-papertrail').Papertrail

const winstonPapertrail = new winston.transports.Papertrail({
  host: 'logs3.papertrailapp.com',
  port: 20251,
  colorize: true,
})

winstonPapertrail.exceptionsLevel = 'error'
winston.handleExceptions(winstonPapertrail)

const consoleLogger = new winston.transports.Console({
  timestamp: function() {
    return new Date().toString()
  },
  colorize: true
})

const transports = [consoleLogger]

if (env.NODE_ENV == 'production') {
  transports.push(winstonPapertrail)
}

const logger = new winston.Logger({
  transports: transports
})

module.exports = logger