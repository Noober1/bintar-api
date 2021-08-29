const _ = require('lodash')

module.exports = function (page = 1,limit = 10) {
    limit = _.parseInt(limit);
    page = _.parseInt(page);
    return {
        perPage: limit,
        currentPage: page
    }
}