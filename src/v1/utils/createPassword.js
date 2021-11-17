const Crypto = require('crypto')

/**
 * Password generator
 * @param {string} password - password to generate
 * @returns Returning generated password
 */
const createPassword = (password, algorithm = 'sha1', encoding = 'hex') => {
    try {
        if (!password) {
            throw new Error('Password invalid')
        }
        return Crypto.createHash(algorithm).update(password).digest(encoding)
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = createPassword