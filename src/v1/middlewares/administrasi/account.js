const { sendError, dataMapping, randomString, getDataFromDb, stringReplaceArray } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");

const ACCOUNT_DB = 'administrasi_rekening'

const getAccount = async(req,res,next) => {
    try {
        const getData = await db(ACCOUNT_DB)
            .paginate(pagination(req.page,req.limit))

        getData.data = getData.data.map(dataMapping.bankAccount)
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAccount
}