const { body } = require('express-validator')
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

const postClass = async(req,res,next) => {
    const { body } = req

    try {
        const checkClassFromDb = await db(CLASS_DB).where({
            semester: body.semester,
            angkatan: body.angkatan
        }).first()

        if (checkClassFromDb) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data with semester and angkatan given already exist',
                code: 'ERR_DATA_EXIST'
            })
        }

        const inserting = await db(CLASS_DB).insert({
            nama: body.name,
            semester: body.semester,
            angkatan: body.angkatan
        })

        return res.json({
            success:true,
            result: inserting
        })
    } catch (error) {
        next(error)
    }
}

const updateClassById = async(req,res,next) => {
    const { body } = req
    const { id } = req.params
    try {
        const checkExistingData = await db(CLASS_DB).where({
            semester: body.semester,
            angkatan: body.angkatan
        }).whereNot('id', id).first()

        console.log(checkExistingData)

        if (checkExistingData) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data with semester and angkatan from other data is exist',
                code: 'ERR_DATA_EXIST'
            })
        }

        const updating = await db(CLASS_DB).where('id',id).update({
            nama: body.name,
            semester: body.semester,
            angkatan: body.angkatan
        })

        return res.json({
            success:true,
            result: updating
        })
    } catch (error) {
        next(error)
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
    deleteClassByIds,
    postClass,
    updateClassById
}