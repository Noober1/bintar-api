const config = require('./config')
const inventaris = require('./inventaris')
const administrasi = require('./administrasi')
const media = require('./media')
const auth = require('./auth')
const user = require('./user')

module.exports = {
    auth,
    config,
    inventaris,
    administrasi,
    media,
    user
}