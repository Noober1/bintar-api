'use strict'
const api = require('./v1')

module.exports = function (app, opts) {
	// Setup routes, middleware, and handlers
	app.use('/v1', api)
}
