const httpStatus = require('http-status');
const db = require('../../../lib/db');
const pagination = require('../../../lib/pagination');
const { dataMapping, sendError } = require('../utils')
const constants = require('../constants')

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
        'administrasi_kelas_angkatan.nama as kelas_nama',
        'administrasi_kelas_angkatan.semester as kelas_semester',
        'administrasi_kelas_angkatan.angkatan as kelas_angkatan',
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

const getStudentByNIS = async(req,res,next) => {
    try {
        if (req.auth.accoutType.is) {
            
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getStudent,
    getStudentByNIS
}