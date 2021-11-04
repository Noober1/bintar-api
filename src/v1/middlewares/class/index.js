const db = require('../../../../lib/db')
const pagination = require('../../../../lib/pagination')
const { dataMapping } = require('../../utils')

const getClass = async(req,res,next) => {
    const { search } = req.query
    console.log(req.query)
    try {
        const getData = await db('administrasi_kelas_angkatan')
            .orderBy([
                {column: 'angkatan', order:'desc'},
                {column: 'semester', order:'desc'},
            ])
            .where('nama', 'like', `%${search || ''}%`)
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