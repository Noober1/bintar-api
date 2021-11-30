const db = require('../../../lib/db')

const MEDIA_DB = 'media'

const getMediaByFileName = name => {
    return db(MEDIA_DB)
    .where({
        nama: name
    })
    .first()
}

module.exports = {
    getMediaByFileName
}