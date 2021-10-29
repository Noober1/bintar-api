const { sendError, dataMapping } = require("../../utils")
const jwt = require('jsonwebtoken')
const db = require('../../../../lib/db')
const Crypto = require('crypto');
const httpStatus = require("http-status")

const sqlQueryAccount = (type = 'admin', sqlWhere) => {
    if (type === 'admin') {
        return db('dbusers')
        .where(sqlWhere)
        .first()

    } else {
        return db('administrasi_mahasiswa')
        .innerJoin('administrasi_kelas_angkatan',function () {
            this.on('administrasi_kelas_angkatan.id','=','administrasi_mahasiswa.kelas')
        })
        .innerJoin('administrasi_prodi',function () {
            this.on('administrasi_prodi.id','=','administrasi_mahasiswa.prodi')
        })
        .select([
            'administrasi_mahasiswa.id',
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
        .where(sqlWhere)
        .first()
    }
}

const postLogin = async(req,res,next) => {
    try {
        const { username, password, app } = req.body
        var userData = null
        var user = {
            accountType: null,
            email: null
        }
        const forbiddenSendErrorValue = {
            status:httpStatus.FORBIDDEN,
            message:'This acount have no permission for this application',
            code: 'NO_PERMISSION'
        }

        if (!username || !password) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                code: 'INVALID_AUTH_DATA',
                message: 'Username nor password not received'
            })
        }

        const encPass = Crypto.createHash('sha1').update(password).digest('hex')
        const sqlWhere = {
            email: username,
            password:encPass
        }


        
        const getUser = sqlQueryAccount('admin', sqlWhere)
        const getStudent = sqlQueryAccount('student', sqlWhere)
        
        const getDataFromDb = await Promise.all([getUser,getStudent])

        if (getDataFromDb[0]) {
            userData = getDataFromDb[0]
            const userPermission = JSON.parse(userData.hak_akses)
            if (userData.level != 'superuser' && !userPermission.includes(app)) {
                throw new sendError(forbiddenSendErrorValue)
            }
            user.accountType = 'admin'
            user.level = userData.level
            user.permission = userPermission || []
        } else if(getDataFromDb[1]) {
            userData = getDataFromDb[1]
            if (userData.status !== 'aktif') {
                throw new sendError(forbiddenSendErrorValue)
            }
            user.accountType = 'student'
            user.type = userData.jenis
        } else {
            throw new sendError({
                status:httpStatus.UNAUTHORIZED,
                message: 'Username or password incorrect',
                code: 'WRONG_AUTH'
            })
        }

        user.email = userData.email
        
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        return res.json({
            ...user,
            accessToken
        })

    } catch (error) {
        next(error)
    }
}

const getProfile = async(req,res,next) => {
    try {
        let { mahasiswa, user } = dataMapping
        if (!req.auth) {
            throw new sendError({
                status:httpStatus.UNAUTHORIZED,
                message: 'Authentication required',
                code: 'UNAUTHORIZED'
            })
        }

        const { email, accountType } = req.auth
        const getData = await sqlQueryAccount(accountType, { email })
        const data = accountType === 'admin' ? user(getData) : mahasiswa(getData)
        return res.json({
            accountType,
            ...data,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProfile,
    postLogin
}