const httpStatus = require('http-status')
const db = require('../../../../lib/db')
const pagination = require('../../../../lib/pagination')
const { dataMapping, sendError } = require('../../utils')

const CLASS_DB = 'administrasi_kelas_angkatan'

const getClass = async(req,res,next) => {
    const { search } = req.query
    console.log(req.query)
    try {
        const getData = await db(CLASS_DB)
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

const getClassById = async(req,res,next) => {
    try {
        const getData = await db(CLASS_DB).where('id', req.params.id).first()

        if (!getData) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Class not found',
                code: 'ERR_CLASS_NOT_FOUND'
            })
        }

        return res.json(dataMapping.kelas(getData))
    } catch (error) {
        
    }
}

const deleteClassByIds = async(req,res,next) => {
    try {
        if (!Array.isArray(req.body.ids)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data invalid',
                code:'ERR_INVALID_DATA'
            })
        }

        const deleting = await db(CLASS_DB).whereIn('id',req.body.ids).del()

        res.json({
            success:true,
            result:deleting
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getClass,
    getClassById,
    deleteClassByIds
}