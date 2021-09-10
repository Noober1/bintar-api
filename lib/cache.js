const cache = require('express-redis-cache')({
	host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth_pass: process.env.REDIS_AUTH,
    expire:10,
    prefix:'api'
});

cache.on('error', function (error) {
    console.error(error)
    process.exit(1)
});

cache.on('connected', () => {
    console.log('Redis cache: OK')
})

module.exports = {
    ...cache,
    routeJSON: (name) => {
        let config = { type: 'application/json'  }
        if (typeof name === 'string') {
            config.name = name
        }
        return cache.route(config)
    }
}