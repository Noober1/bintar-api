'use strict'
const api = require('./src/v1')

module.exports = function (app, opts) {
	// Setup routes, middleware, and handlers
	app.all('/',(req,res) => {
		return res.json({
			message:'OK'
		})
	})
	app.use('/v1', api)
}
