const db = require('../../../../lib/db')
const pagination = require('../../../../lib/pagination')
const { dataMapping } = require('../../utils')

const getClass = async(req,res,next) => {
    try {
        const getData = await db('administrasi_kelas_angkatan')
            .paginate(pagination(req.page,req.limit))

        getData.data = getData.data.map(dataMapping.kelas)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getClass
}