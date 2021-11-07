const httpStatus = require('http-status');
const db = require('../../../lib/db');
const pagination = require('../../../lib/pagination');
const { dataMapping, sendError } = require('../utils')
const constants = require('../constants')
const Crypto = require('crypto')

const _studentQuery = () => {
    return db('administrasi_mahasiswa')
    .innerJoin('administrasi_kelas_angkatan',function () {
        this.on('administrasi_kelas_angkatan.id','=','administrasi_mahasiswa.kelas')
    })
    .innerJoin('administrasi_prodi',function () {
        this.on('administrasi_prodi.id','=','administrasi_mahasiswa.prodi')
    })
    .select([
        'administrasi_mahasiswa.id',
        'administrasi_mahasiswa.NIS',
        'administrasi_mahasiswa.nama_depan',
        'administrasi_mahasiswa.nama_belakang',
        'administrasi_mahasiswa.email',
        'administrasi_mahasiswa.status',
        'administrasi_mahasiswa.jenis',
        'administrasi_mahasiswa.tahun_masuk',
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
            "administrasi_mahasiswa.id": req.params.id
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
        const getStudentByEmail = await db('administrasi_mahasiswa')
            .where({email})
            .first()

        const getUserByEmail = await db('dbusers')
            .where({email})
            .first()
            
        if (getStudentByEmail || getUserByEmail) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message:'Email already exist',
                code: 'ERR_EMAIL_EXIST'
            })
        }

        const getClassById = await db('administrasi_kelas_angkatan')
            .where('id', classId)

        if (!getClassById) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message:'Class with id given not found',
                code: 'ERR_CLASS_NOT_FOUND'
            })
        }

        const getProdi = await db('administrasi_prodi')
            .where('id', prodi)

        if (!getProdi) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Prodi with id given not found',
                code: 'ERR_PRODI_NOT_FOUND'
            })
        }

        const inserting = await db('administrasi_mahasiswa').insert({
            NIS:body.NIS,
            nama_depan: body.firstName,
            nama_belakang: body.lastName,
            email: body.email,
            password: Crypto.createHash('sha1').update(body.password).digest('hex'),
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
        if (!Array.isArray(body)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data given invalid',
                code: 'ERR_DATA_INVALID'
            })
        }

        const deleting = await db('administrasi_mahasiswa')
            .select('id')
            .whereIn('id', body)
            .del()

        return res.json({
            success:true,
            result: deleting
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
    getStudentById
}