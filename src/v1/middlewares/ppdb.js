const { sendError, dataMapping } = require("../utils");
const db = require("../../../lib/db");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const _ = require("lodash")

const ppdb = {}

const _getBasicData = () => {
    return db('dbid').select().first()
}

const generatePSBRegNumber = async (length = 3) => {
    try {
        const { PPDB_Tahun, PPDB_regex } = await db("dbid").first()
        let regex = PPDB_regex
        // create random number with length with lodash
        const randomNumber = _.padStart(Math.floor(Math.random() * Math.floor(Math.pow(10, length))), length, '0')
        if (!PPDB_regex.indexOf("_I_") && !PPDB_regex.indexOf("_N_")) {
            regex = 'PSB-_Y_-_I_-_N_';
        }

        const registerNumber = regex.stringReplace(['_Y_', '_I_', '_N_'], [PPDB_Tahun, 'ONL', randomNumber])
        const checkingNumberFromDatabase = await db("PPDBsiswa").where("no_pendaftaran", registerNumber).first()
        if (checkingNumberFromDatabase) {
            generatePSBRegNumber(length)
        } else {
            return registerNumber
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

ppdb.postRegister = async (req, res, next) => {
    try {
        const fetch = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captchaToken}`,
            {},
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                },
            },
        );
        if (!fetch.data.success) {
            throw new sendError({
                status: httpStatus.FORBIDDEN,
                message: "Captcha invalid",
                code: "ERR_CAPTCHA_INVALID",
            })
        }

        const validatingDate = new Date(req.body.birthDate)
        if (!validatingDate.getTime()) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: "Invalid date",
                code: "ERR_INVALID_DATE",
            })
        }

        const searchEmailFromPPDB = await db("PPDBsiswa").where("email", req.body.email).first()
        const searchEmailFromStudent = await db("dbsiswa").where("email", req.body.email).first()
        const searchEmailFromUser = await db("dbusers").where("email", req.body.email).first()

        if (searchEmailFromPPDB || searchEmailFromStudent || searchEmailFromUser) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: "Email yang anda masukan sudah terdaftar",
                code: "ERR_EMAIL_EXIST",
            })
        }

        const getSchool = await db("dbsekolah").where('kode', req.body.lastEducationSchool).first()
        if (!getSchool) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: "School ID was not found",
                code: "ERR_INVALID_SCHOOL_ID",
            })
        }

        const getJurusan = await db("dbjurusan").where('nama_jurusan', req.body.selectedMajor).first()
        if (!getJurusan) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: "Major not found",
                code: "ERR_INVALID_MAJOR",
            })
        }

        const generatingPSBNumber = await generatePSBRegNumber(4)

        const insertingData = {
            no_pendaftaran: generatingPSBNumber,
            PPDB_tahun: new Date().getFullYear(),
            tanggal: new Date(),
            nama_depan: req.body.firstName,
            nama_belakang: req.body.lastName,
            email: req.body.email,
            no_telpon: req.body.phone,
            tempat_lahir: req.body.birthPlace,
            tanggal_lahir: validatingDate,
            pendidikan_terakhir: req.body.lastEducation,
            sekolah_lulus: req.body.graduateYear,
            asal_sekolah: req.body.lastEducationSchool,
            nisn: req.body.nisn,
            jurusan_pilih: req.body.selectedMajor,
            jenis_kelamin: req.body.sex
        }

        const inserting = await db("PPDBsiswa").insert(insertingData)

        if (!inserting) {
            throw new sendError({
                status: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to register",
                code: "ERR_FAILED_TO_REGISTER",
            })
        }

        return res.json({
            success: true
        })

    } catch (error) {
        next(error)
    }
}

// post login
ppdb.postLogin = async (req, res, next) => {
    try {
        const { PPDB_Tahun } = await _getBasicData()
        const { username, password } = req.body;
        if (!username || !password) {
            throw new sendError({
                code: "ERR_UNAUTHORIZED",
                status: httpStatus.UNAUTHORIZED,
                message: "Username dan password harus diisi",
            });
        }
        const getData = await db("PPDBsiswa")
            .select("id", "email", "no_telpon")
            .where({
                email: username,
                no_telpon: password,
                PPDB_tahun: PPDB_Tahun
            })
            .first();

        if (getData) {
            const accessToken = jwt.sign(
                {
                    id: getData.id,
                    email: getData.email,
                },
                process.env.ACCESS_TOKEN_SECRET
            );
            return res.json({
                success: true,
                accessToken: accessToken,
            });
        }

        throw new sendError({
            code: "ERR_AUTH_INVALID",
            message: "Username atau password salah",
            status: httpStatus.UNAUTHORIZED,
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}

// profile route
ppdb.getProfile = async (req, res, next) => {
    try {
        const getData = await db("PPDBsiswa")
            .select("nama_depan", "nama_belakang", "email", "bio_edited")
            .where("id", req.auth.id)
            .first();

        return res.json({
            firstName: getData.nama_depan,
            lastName: getData.nama_belakang,
            fullName: getData.nama_depan + " " + getData.nama_belakang,
            profileComplete: getData.bio_edited == "Y"
        });
    } catch (error) {
        next(error);
    }
}

// get bio
ppdb.getBio = async (req, res, next) => {
    try {
        const getData = await db("PPDBsiswa")
            .select([
                'id', 'PPDB_tahun', 'tanggal',
                'no_pendaftaran', 'nama_depan',
                'nama_belakang', 'asal_sekolah',
                'jurusan_pilih', 'penyakit_kambuhan',
                'penyakit_berat', 'nisn',
                'kps_kip', 'no_ujian', 'no_ijazah',
                'no_skhun', 'no_telpon', 'no_telpon_ortu',
                'nama_panggilan', 'jenis_kelamin', 'tempat_lahir',
                'tanggal_lahir', 'agama', 'kewarganegaraan',
                'anak_ke', 'anak_dari', 'saudara_kandung',
                'saudara_tiri', 'saudara_angkat',
                'status_keluarga', 'bahasa_rumah',
                'alamat_kampung', 'alamat_desa',
                'alamat_kecamatan', 'alamat_kabupaten',
                'alamat_provinsi', 'kode_pos', 'email',
                'tinggal_bersama', 'jarak_sekolah',
                'berat_badan', 'tinggi_badan', 'golongan_darah',
                'pendidikan_terakhir', 'sekolah_lulus', 'ayah_nama',
                'ayah_ttl', 'ayah_kewarganegaraan', 'ayah_pendidikan',
                'ayah_pekerjaan', 'ayah_penghasilan', 'ayah_alamat',
                'ibu_nama', 'ibu_ttl', 'ibu_kewarganegaraan',
                'ibu_pendidikan', 'ibu_pekerjaan', 'ibu_penghasilan',
                'ibu_alamat', 'peroleh_info'
            ])
            .where('id', req.auth.id).first()

        return res.json(dataMapping.ppdbBio(getData));
    } catch (error) {
        next(error)
    }
}

// get sekolah list
ppdb.getSekolah = async (req, res, next) => {
    try {
        const getSekolah = await db("dbsekolah").where('nama_sekolah', 'like', `%${req.query.search || ''}%`)
        return res.json(getSekolah)
    } catch (error) {
        next(error)
    }
}

// get jurusan list
ppdb.getJurusan = async (req, res, next) => {
    try {
        const getJurusan = await db("dbjurusan").where('nama_jurusan', 'like', `%${req.query.search || ''}%`)
        return res.json(getJurusan.map(item => ({
            id: item.id,
            name: item.nama_jurusan,
            initial: item.inisial_jurusan
        })))
    } catch (error) {
        next(error)
    }
}

module.exports = ppdb;
