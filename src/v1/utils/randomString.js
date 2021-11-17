const _ = require('lodash')

/**
 * generating random strings
 * @param {*} length - strings length to be generate
 * @returns random string
 */
module.exports = (length = 10) => _.times(length, () => _.random(35).toString(36)).join('');