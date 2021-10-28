const db = require('../../../../lib/db');
const pagination = require('../../../../lib/pagination');
const { dataMapping } = require('../../utils')

const getUser = async(req,res,next) => {
    try {
        const getUser = await db('dbusers')
            .paginate(pagination(req.page,req.limit));
        
        getUser.data = getUser.data.map(dataMapping.user)
        return res.json(getUser)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUser
}