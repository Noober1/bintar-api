const config = require('./config')
const inventaris = require('./inventaris')
const administrasi = require('./administrasi')
const media = require('./media')
const auth = require('./auth')
const user = require('./user')
const student = require('./student')

module.exports = {
    auth,
    config,
    user,
    student,
    inventaris,
    administrasi,
    media,
}