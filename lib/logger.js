const db = require('./db')

const logger = async(name = 'other',message = 'No message', user = null, data = '') => {
    const writeLog = await db('dblog').insert({
        date: new Date(),
        name: 'inventaris_' + name,
        msg: message,
        data,
        user
    })

    return writeLog
}

module.exports = {
    logger
}