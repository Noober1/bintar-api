const config = require('./config')
const inventaris = require('./inventaris')
const administrasi = require('./administrasi')
const media = require('./media')
const auth = require('./auth')
const user = require('./user')
const classAngkatan = require('./class')
const student = require('./student')
const prodi = require('./prodi')

module.exports = {
    auth,
    config,
    user,
    student,
    inventaris,
    administrasi,
    classAngkatan,
    media,
    prodi
}