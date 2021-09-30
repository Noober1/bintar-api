'use strict'
require('./lib/utils')
const express = require('express')
const httpErrors = require('http-errors')
const pino = require('pino')
const pinoHttp = require('pino-http')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./lib/db')

module.exports = function main (options, cb) {

	// Set default options
	const ready = cb || function () {}
	const opts = Object.assign({
		// Default options
	}, options)

	const logger = pino()

	// Server state
	let server
	let serverStarted = false
	let serverClosing = false

	// Setup error handling
	function unhandledError (err) {
		// Log the errors
		logger.error(err)

		// Only clean up once
		if (serverClosing) {
			return
		}
		serverClosing = true

		// If server has started, close it down
		if (serverStarted) {
			server.close(function () {
				process.exit(1)
			})
		}
	}
	process.on('uncaughtException', unhandledError)
	process.on('unhandledRejection', unhandledError)

	// Create the express app
	const app = express()

	// Common middleware
	app.use((req,res,next) => {
		req.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
		next()
	})

	// cors configuration
	app.use(cors())

	// bodyparser urlencode config
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	// bodyparser json config
	app.use(bodyParser.json({
		limit: "8mb",
	}));

	app.use(pinoHttp({ logger }))
		
	// Register routes
	// @NOTE: require here because this ensures that even syntax errors
	// or other startup related errors are caught logged and debuggable.
	// Alternativly, you could setup external log handling for startup
	// errors and handle them outside the node process.  I find this is
	// better because it works out of the box even in local development.
	require('./routes')(app, opts)

	// Common error handlers
	app.use(function fourOhFourHandler (req, res, next) {
		next(httpErrors(404, `Route not found: ${req.url}`))
	})

	app.use(function fiveHundredHandler (err, req, res, next) {
		if (err.status >= 500) {
			logger.error(err)
		}
		res.status(err.status || 500).json({
			code: err.code || 'InternalServerError',
			message: err.message
		})
	})

	// function for checking database connection
	const checkDbConnection = async() => {
		try {
			await db('dbid')
			return false;
		} catch (error) {
			return {
				message:'Database connection error, make sure to check database configuration from .env file',
				code:error.code
			}
		}
	}

	// Start server
	server = app.listen(opts.port, opts.host, async function (err) {

		const consoleLogGutter = '==================='

		console.log(consoleLogGutter)
		console.log('bintar-api starting')
		console.log(consoleLogGutter)

		if (err) {
			return ready(err, app, server)
		}

		//execute database connection check
		const isError = await checkDbConnection()
		if (isError) {
			console.log(isError)
			return ready(new Error(isError.message))
		} else {
			console.log('Database connection: OK')
		}

		// If some other error means we should close
		if (serverClosing) {
			return ready(new Error('Server was closed before it could start'))
		}

		serverStarted = true
		const addr = server.address()
		console.log('Web service: OK')
		console.log(consoleLogGutter)
		logger.info(`Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`)
		ready(err, app, server)
	})
}

