const httpStatus = require('http-status');
const db = require('../../../lib/db');
const pagination = require('../../../lib/pagination');
const { dataMapping, sendError, createPassword } = require('../utils')
const constants = require('../constants')

const STUDENT_DB = 'administrasi_mahasiswa'

const _getUserByEmail = email => db('dbusers')
    .where({email})
    .first()

const _getClassById = id => db('administrasi_kelas_angkatan')
    .where('id', id)

const _getProdiById = id => db('administrasi_prodi')
    .where('id', id)



const _studentQuery = () => {
    return db(STUDENT_DB)
    .innerJoin('administrasi_kelas_angkatan',function () {
        this.on('administrasi_kelas_angkatan.id','=',STUDENT_DB + '.kelas')
    })
    .innerJoin('administrasi_prodi',function () {
        this.on('administrasi_prodi.id','=',STUDENT_DB + '.prodi')
    })
    .select([
        STUDENT_DB + '.id',
        STUDENT_DB + '.NIS',
        STUDENT_DB + '.nama_depan',
        STUDENT_DB + '.nama_belakang',
        STUDENT_DB + '.email',
        STUDENT_DB + '.status',
        STUDENT_DB + '.jenis',
        STUDENT_DB + '.tahun_masuk',
        'administrasi_kelas_angkatan.id as kelas_id',
        'administrasi_kelas_angkatan.nama as kelas_nama',
        'administrasi_kelas_angkatan.semester as kelas_semester',
        'administrasi_kelas_angkatan.angkatan as kelas_angkatan',
        'administrasi_prodi.id as prodi_id',
        'administrasi_prodi.kode as prodi_kode',
        'administrasi_prodi.nama as prodi_nama'
    ])
}

const getStudent = async(req,res,next) => {
    try {
        const getStudent = await _studentQuery()
        .paginate(pagination(req.page,req.limit))

        getStudent.data = getStudent.data.map(dataMapping.mahasiswa)

        return res.json(getStudent)
    } catch (error) {
        next(error)
    }
}

const getStudentById = async(req,res,next) => {
    try {
        const getStudent = await _studentQuery().where({
            [STUDENT_DB + '.id']: req.params.id
        })
        .first()

        return res.json(dataMapping.mahasiswa(getStudent))
    } catch (error) {
        next(error)
    }
}

const getStudentByNIS = async(req,res,next) => {
    try {
        return res.send('still developing')
    } catch (error) {
        next(error)
    }
}

const postStudent = async(req,res,next) => {
    const { email, class:classId, angkatan, prodi } = req.body
    const { body } = req
    try {
        const getStudentByEmail = await db(STUDENT_DB)
            .where({email})
            .first()

        const getUserByEmail = await _getUserByEmail(email)
            
        if (getStudentByEmail || getUserByEmail) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message:'Email already exist',
                code: 'ERR_EMAIL_EXIST'
            })
        }

        const getClassById = await _getClassById(classId)

        if (!getClassById) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message:'Class with id given not found',
                code: 'ERR_CLASS_NOT_FOUND'
            })
        }

        const getProdi = await _getProdiById(prodi)

        if (!getProdi) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Prodi with id given not found',
                code: 'ERR_PRODI_NOT_FOUND'
            })
        }

        const inserting = await db(STUDENT_DB).insert({
            NIS:body.NIS,
            nama_depan: body.firstName,
            nama_belakang: body.lastName,
            email: body.email,
            password: createPassword(body.password),
            status: body.status,
            kelas: classId,
            jenis: body.jenis,
            tahun_masuk: body.registerYear,
            prodi
        })

        if (!inserting) {
            throw new sendError({
                status:httpStatus.INTERNAL_SERVER_ERROR,
                code: 'ERR_INTERNAL',
                message: 'Unknown Error'
            })
        }

        return res.json({
            success:true,
            result: inserting
        })

    } catch (error) {
        next(error)
    }
}

const deleteStudent = async(req,res,next) => {
    const { body } = req
    try {
        if (!Array.isArray(body.ids)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data given invalid',
                code: 'ERR_DATA_INVALID'
            })
        }

        const deleting = await db(STUDENT_DB)
            .select('id')
            .whereIn('id', body.ids)
            .del()

        return res.json({
            success:true,
            result: deleting
        })
    } catch (error) {
        next(error)
    }
}

const updateStudent = async(req,res,next) => {
    const where = {
        id: req.params.id
    }
    const { body } = req
    try {

        const getSiswa = await db(STUDENT_DB).where(where).first()
        if (!getSiswa) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message:'Student not found',
                code: 'ERR_STUDENT_NOT_FOUND'
            })
        }

        const getClassById = await _getClassById(body.class)
        if (!getClassById) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Class not with id given not found',
                code: 'ERR_CLASS_NOT_FOUND'
            })
        }

        const getProdiById = await _getProdiById(body.prodi)
        if (!getProdiById) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Prodi not with id given not found',
                code: 'ERR_PRODI_NOT_FOUND'
            })
        }

        const getUserByEmail = await _getUserByEmail(body.email)
        const getStudentByEmailAndId = await db(STUDENT_DB)
            .where('email', body.email)
            .whereNot('id', req.params.id)

        if (getUserByEmail || getStudentByEmailAndId.length > 0) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message:'Email already exist from other user / student',
                code: 'ERR_EMAIL_EXIST'
            })
        }

        const data2Update = {
            NIS:body.NIS,
            nama_depan: body.firstName,
            nama_belakang: body.lastName,
            email: body.email,
            status: body.status,
            kelas: body.class,
            jenis: body.type
        }

        if (body.password.length > 0) {
            data2Update.password = createPassword(body.password)
        }

        const updating = await db(STUDENT_DB).where(where).update(data2Update)
        
        return res.json({
            success:true,
            result: updating
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getStudent,
    getStudentByNIS,
    postStudent,
    deleteStudent,
    getStudentById,
    updateStudent
}