var logger = require('winston')
var WinstonDailyRotateFile = require('winston-daily-rotate-file')
var integratorExtension = require('express-integrator-extension')
var AWS = require('aws-sdk')

var consoleTransportOpts = {
  colorize: true,
  timestamp: true,
  prettyPrint: true
}

var fileTransportOpts = {
  filename: './server.log',
  maxsize: 10000000,
  maxFiles: 2,
  json: false,
  handleExceptions: true
}

logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, consoleTransportOpts)
logger.add(WinstonDailyRotateFile, fileTransportOpts)

// we need the logs from all our 3rd party modules.
var consoleOpts = ['log', 'profile', 'startTimer']
consoleOpts.concat(Object.keys(logger.levels)).forEach(function (method) {
    console[method] = function () {
      return logger[method].apply(logger, arguments)
    }
  })
var log = console.log
console.log = function hijacked_log (level) {
  if (arguments.length > 1 && level in this) {
    log.apply(this, arguments)
  } else {
    var args = Array.prototype.slice.call(arguments)
    args.unshift('info')
    log.apply(this, args)
  }
}

var options = {
  connectors: {'123': '123'},
  systemToken: '12323',
  port: 8081
}

integratorExtension.createServer(options, function (error) {
  if (error) {
    logger.error('Failed to create integrator extension server due to: ' + error.message)
    throw error
  }
  var params = {
    Bucket: 'io-ramtest'
  }

  new AWS.S3().listObjects(params, function (err, data) {
    if (err) return logger.error(err)
    logger.info('List Objects call is successful')
    logger.info(data)
  })

  logger.info('logName=serverStarted')
})
