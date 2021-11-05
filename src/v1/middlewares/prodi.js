const httpStatus = require('http-status');
const db = require('../../../lib/db');
const pagination = require('../../../lib/pagination');
const { dataMapping, sendError } = require('../utils')
const constants = require('../constants')

const getProdi = async(req,res,next) => {
    try {
        const getData = await db('administrasi_prodi')
            .paginate(pagination(req.page,req.limit))
        
        getData.data = getData.data.map(dataMapping.prodi)
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProdi
}