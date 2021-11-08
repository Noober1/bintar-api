const Crypto = require('crypto')

const createPassword = (password) => {
    try {
        if (!password) {
            throw new Error('Password invalid')
        }
        return Crypto.createHash('sha1').update(password).digest('hex')
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = createPassword