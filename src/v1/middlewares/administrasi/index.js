const { sendError } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination")

const getPayment = async(req,res,next) => {
    try {
        const getData = await db('administrasi_kelas_angkatan')
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPayment
}