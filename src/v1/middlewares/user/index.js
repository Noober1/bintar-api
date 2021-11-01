const httpStatus = require('http-status');
const db = require('../../../../lib/db');
const pagination = require('../../../../lib/pagination');
const { dataMapping, sendError } = require('../../utils')
const constants = require('../../constants')

const getUser = async(req,res,next) => {
    try {
        if (req.auth.accountType !== 'admin') {
            throw new sendError({
                status:httpStatus.FORBIDDEN,
                message: constants.FORBIDDEN.text,
                code: constants.FORBIDDEN.code
            })
        }
        const getUser = await db('dbusers')
            .paginate(pagination(req.page,req.limit))
        
        getUser.data = getUser.data.map(dataMapping.user)
        return res.json(getUser)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUser
}