const _ = require('lodash')

module.exports = (length = 10) => _.times(length, () => _.random(35).toString(36)).join('');