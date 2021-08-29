const httpStatus = require('http-status')
const _ = require('lodash')

// Validasi query limit dan page untuk pagination
module.exports = (req,res,next) => {
    let { limit, page } = req.query

    if (limit) {
        limit = _.parseInt(limit)
        if (_.isNaN(limit)) return res.status(httpStatus.BAD_REQUEST).json({
            message:'Invalid parameter: limit type data must be integer'
        })
    }

    if (page) {
        page = _.parseInt(page)
        if (_.isNaN(page)) return res.status(httpStatus.BAD_REQUEST).json({
            message:'Invalid parameter: page type data must be integer'
        })
    }

    req.limit = limit ? limit : 10
    req.page = page ? page : 1
    next()
}