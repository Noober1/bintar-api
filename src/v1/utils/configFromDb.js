const db = require('../../../lib/db')

// const configFromDb = function(value) {
//     // return 'hehe'
//     // this.get = value => {
//     //     if (Object.keys(value).length > 0) {
//     //         console.log('load from cache')
//     //         return value
//     //     } else {
//     //         this.set().then(result => {
//     //             return result
//     //         })
//     //     }
//     // }
//     // this.set = value => {
//     //     return db('dbid')
//     //         .first()
//     //         .then(result => {
//     //             console.log(result)
//     //             value = result
//     //         })
//     // }
// }

const configFromDb = value => ({
    get:() => {
        try {
            if (Object.keys(value).length > 0) {
                console.log('load from cache')
                return value
            } else {
                console.log('load from db')
                db('dbid')
                .first()
                .then(result => {
                    value = result
                })
                return value
            }
        } catch (error) {
            console.log(error)
            return false
        }
    },
    set:newValue => {
        value = newValue
    }
})

module.exports = configFromDb