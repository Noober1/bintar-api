const config = require('./config')
const inventaris = require('./inventaris')
const administrasi = require('./administrasi')
const utils = require('./inventaris/utils')
const media = require('./media')
const user = require('./user')
const student = require('./student')

module.exports = {
    config,
    user,
    student,
    inventaris,
    administrasi,
    utils,
    media,
}