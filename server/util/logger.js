const winston = require('winston')

require('winston-papertrail').Papertrail

const winstonPapertrail = new winston.transports.Papertrail({
  host: 'logs3.papertrailapp.com',
  port: 20251,
  colorize: true,
})

const logger = new winston.Logger({
  transports: [winstonPapertrail]
})


module.exports = logger