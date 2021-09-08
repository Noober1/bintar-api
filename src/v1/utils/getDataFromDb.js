const db = require('../../../lib/db')

module.exports = () => {
    return new Promise(async(resolve, reject) => {
        try {
            const getData = await db('dbid').first()
            
            if(!getData) {
                throw new Error('Unable get data from dbid')
            }
            
            resolve(getData)
        } catch (error) {
            reject(error)
        }
    })
}