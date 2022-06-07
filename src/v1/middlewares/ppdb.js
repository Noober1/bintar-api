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
            .select("nama_depan", "nama_belakang", "email", "basic_edited", "number_edited", "advanced_edited", "address_edited", "additional_edited", "parent_edited")
            .where("id", req.auth.id)
            .first();

        return res.json({
            firstName: getData.nama_depan,
            lastName: getData.nama_belakang,
            fullName: getData.nama_depan + " " + getData.nama_belakang,
            profileComplete: {
                basic: getData.basic_edited == "Y",
                number: getData.number_edited == "Y",
                advanced: getData.advanced_edited == "Y",
                address: getData.address_edited == "Y",
                additional: getData.additional_edited == "Y",
                parent: getData.parent_edited == "Y"
            }
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
                'PPDBsiswa.id',
                'PPDBsiswa.PPDB_tahun',
                'PPDBsiswa.tanggal',
                'PPDBsiswa.no_pendaftaran',
                'PPDBsiswa.nama_depan',
                'PPDBsiswa.nama_belakang',
                'dbsekolah.kode as asal_sekolah_kode',
                'dbsekolah.nama_sekolah as asal_sekolah_nama',
                'PPDBsiswa.jurusan_pilih',
                'PPDBsiswa.penyakit_kambuhan',
                'PPDBsiswa.penyakit_berat',
                'PPDBsiswa.nisn',
                'PPDBsiswa.kps_kip',
                'PPDBsiswa.no_ujian',
                'PPDBsiswa.no_ijazah',
                'PPDBsiswa.no_skhun',
                'PPDBsiswa.no_telpon',
                'PPDBsiswa.no_telpon_ortu',
                'PPDBsiswa.nama_panggilan',
                'PPDBsiswa.jenis_kelamin',
                'PPDBsiswa.tempat_lahir',
                'PPDBsiswa.tanggal_lahir',
                'PPDBsiswa.agama',
                'PPDBsiswa.kewarganegaraan',
                'PPDBsiswa.anak_ke',
                'PPDBsiswa.anak_dari',
                'PPDBsiswa.saudara_kandung',
                'PPDBsiswa.saudara_tiri',
                'PPDBsiswa.saudara_angkat',
                'PPDBsiswa.status_keluarga',
                'PPDBsiswa.bahasa_rumah',
                'PPDBsiswa.alamat_kampung',
                'villages.id as alamat_desa_id',
                'villages.name as alamat_desa_nama',
                'districts.id as alamat_kecamatan_id',
                'districts.name as alamat_kecamatan_nama',
                'regencies.id as alamat_kabupaten_id',
                'regencies.name as alamat_kabupaten_nama',
                'provinces.id as alamat_provinsi_id',
                'provinces.name as alamat_provinsi_nama',
                'PPDBsiswa.kode_pos',
                'PPDBsiswa.email',
                'PPDBsiswa.tinggal_bersama',
                'PPDBsiswa.jarak_sekolah',
                'PPDBsiswa.berat_badan',
                'PPDBsiswa.tinggi_badan',
                'PPDBsiswa.golongan_darah',
                'PPDBsiswa.pendidikan_terakhir',
                'PPDBsiswa.sekolah_lulus',
                'PPDBsiswa.ayah_nama',
                'PPDBsiswa.ayah_ttl',
                'PPDBsiswa.ayah_kewarganegaraan',
                'PPDBsiswa.ayah_pendidikan',
                'PPDBsiswa.ayah_pekerjaan',
                'PPDBsiswa.ayah_penghasilan',
                'PPDBsiswa.ayah_alamat',
                'PPDBsiswa.ibu_nama',
                'PPDBsiswa.ibu_ttl',
                'PPDBsiswa.ibu_kewarganegaraan',
                'PPDBsiswa.ibu_pendidikan',
                'PPDBsiswa.ibu_pekerjaan',
                'PPDBsiswa.ibu_penghasilan',
                'PPDBsiswa.ibu_alamat',
                'PPDBsiswa.peroleh_info',
                'PPDBsiswa.basic_edited',
                'PPDBsiswa.number_edited',
                'PPDBsiswa.advanced_edited',
                'PPDBsiswa.additional_edited',
                'PPDBsiswa.address_edited',
                'PPDBsiswa.parent_edited',
            ])
            .leftJoin('dbsekolah', 'dbsekolah.kode', '=', 'PPDBsiswa.asal_sekolah')
            .leftJoin('villages', 'villages.id', '=', 'PPDBsiswa.alamat_desa')
            .leftJoin('districts', 'districts.id', '=', 'PPDBsiswa.alamat_kecamatan')
            .leftJoin('regencies', 'regencies.id', '=', 'PPDBsiswa.alamat_kabupaten')
            .leftJoin('provinces', 'provinces.id', '=', 'PPDBsiswa.alamat_provinsi')
            .where('PPDBsiswa.id', req.auth.id).first()

        return res.json(dataMapping.ppdbBio(getData));
    } catch (error) {
        next(error)
    }
}

ppdb.putBioBasic = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                nama_depan: body.firstName,
                nama_belakang: body.lastName,
                tempat_lahir: body.birthPlace,
                tanggal_lahir: new Date(body.birthDate),
                sekolah_lulus: body.graduateYear,
                pendidikan_terakhir: body.lastEducation,
                asal_sekolah: body.lastEducationSchool,
                jurusan_pilih: body.selectedMajor,
                jenis_kelamin: body.sex,
                basic_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
    } catch (error) {
        next(error)
    }
}

ppdb.putBioNumber = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                no_telpon: body.phone,
                nisn: body.nisn,
                kps_kip: body.kipkps,
                no_ujian: body.examNumber,
                no_ijazah: body.certificateNumber,
                no_skhun: body.SKHUNNumber,
                number_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
    } catch (error) {
        next(error)
    }
}

ppdb.putBioAdvanced = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                saudara_angkat: body.adoptedSiblingCount,
                anak_ke: body.childPosition,
                anak_dari: body.childCount,
                status_keluarga: body.familyStatus,
                bahasa_rumah: body.motherLanguage,
                kewarganegaraan: body.nationality,
                nama_panggilan: body.nickname,
                agama: body.religion,
                saudara_kandung: body.siblingCount,
                saudara_tiri: body.stepSiblingCount,
                advanced_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
    } catch (error) {
        next(error)
    }
}

ppdb.putBioAddress = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                alamat_kampung: body.street,
                alamat_desa: body.village,
                alamat_kecamatan: body.district,
                alamat_kabupaten: body.city,
                alamat_provinsi: body.province,
                kode_pos: body.postalCode,
                address_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
    } catch (error) {
        next(error)
    }
}

ppdb.putBioAdditional = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                golongan_darah: body.bloodType,
                tinggi_badan: body.height,
                berat_badan: body.weight,
                jarak_sekolah: body.homeToSchoolDistance,
                tinggal_bersama: body.livingWith,
                penyakit_kambuhan: body.relapsingDisease,
                penyakit_berat: body.seriousDisease,
                additional_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
    } catch (error) {
        next(error)
    }
}

ppdb.putBioParent = async (req, res, next) => {
    const { body } = req
    try {
        const updating = await db("PPDBsiswa")
            .where("id", req.auth.id)
            .update({
                ayah_alamat: body.fatherAddress,
                ayah_ttl: body.fatherBirthDate,
                ayah_pendidikan: body.fatherEducation,
                ayah_nama: body.fatherFullname,
                ayah_penghasilan: body.fatherIncome,
                ayah_kewarganegaraan: body.fatherNationality,
                ayah_pekerjaan: body.fatherOccupation,
                ibu_nama: body.motherAddress,
                ibu_ttl: body.motherBirthDate,
                ibu_pendidikan: body.motherEducation,
                ibu_alamat: body.motherFullname,
                ibu_penghasilan: body.motherIncome,
                ibu_kewarganegaraan: body.motherNationality,
                ibu_pekerjaan: body.motherOccupation,
                parent_edited: "Y"
            })

        return res.json({
            success: true,
            data: updating
        })
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
