const httpStatus = require("http-status")
const excelToJson = require("../../../../lib/excelToJson")
const { STUDENT_DB, USER_DB, CLASS_DB, PRODI_DB } = require("../../constants")
const { sendError, createPassword } = require("../../utils")
const db = require('../../../../lib/db')
const _ = require('lodash')

const studentHeaderArray = [
    'No','NIS','Email','Kata sandi','Nama depan','Nama belakang','Kelas','Prodi','Jenis','Status'
]

const studentUpload = async(req,res,next) => {
    try {
        // read excel from buffer then convert it to JSON
        const convert = await excelToJson(req.file.buffer)
        if (!convert.isValidTemplate(studentHeaderArray)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                code: 'ERR_WRONG_TEMPLATE',
                message: 'Wrong student template'
            })
        }

        var data = convert.getData()

        // throw error if data cannot be read
        if (!data) {
            throw new sendError({
                code: 'ERR_NO_DATA',
                message: 'Cannot read data from template'
            })
        }

        const _getArrayByIndex = index => data.map(item => item[index])
        const findDuplicateNIS = _getArrayByIndex('NIS').findDuplicate()
        const findDuplicateEmail = _getArrayByIndex('Email').findDuplicate()

        // if find duplicate, throw error
        if (findDuplicateNIS || findDuplicateEmail) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                code: 'ERR_TEMPLATE_DUPLICATE_VALUE',
                message: 'Duplicate value from template',
                data: {
                    'NIS': findDuplicateNIS || undefined,
                    'Email': findDuplicateEmail || undefined
                }
            })
        }

        const _getDataFromDb = (select, key) => db(STUDENT_DB).select(select).whereIn(select, _getArrayByIndex(key))
        const getNISFromDb = await _getDataFromDb('NIS','NIS')
        const mapNISFromDb = getNISFromDb.map(item => item.NIS)
        const getEmailFromDb = await _getDataFromDb('email','Email')
        const getEmailFromStaffDb = await db(USER_DB).select('email').whereIn('email', _getArrayByIndex('Email'))

        // email validation
        // if any email from template found in database, throw error
        if (getEmailFromDb.length > 0 || getEmailFromStaffDb.length > 0) {
            throw new sendError({
                status: httpStatus.FORBIDDEN,
                code: 'ERR_EMAIL_EXIST',
                message: 'Email(s) from template already exist',
                data: [
                    ...getEmailFromDb.map(item => item.email),
                    ...getEmailFromStaffDb.map(item => item.email)
                ]
            })
        }

        // class validation 
        // get all class code from database
        const getAllClassCodeFromDb = await db(CLASS_DB).select('kode','id','angkatan')
        const mapClassFromDb = getAllClassCodeFromDb.map(element => element.kode)
        const getClassFromTemplate = _.uniqBy(data.map(item => item.Kelas))
        // filter class when class can't be found in array class database
        const findClassNotFound = getClassFromTemplate.filter(item => !mapClassFromDb.includes(item))
        // if class not found is more than zero(zero mean all class found)
        if (findClassNotFound.length > 0) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                code: 'ERR_CLASS_NOT_FOUND',
                message: 'Some class(es) couldn\'t be found in database',
                data: findClassNotFound
            })
        }

        // prodi validation
        const getAllProdiCodeFromDb = await db(PRODI_DB).select('kode','id')
        const mapProdiFromDb = getAllProdiCodeFromDb.map(item => item.kode)
        const getProdiFromTemplate = _.uniqBy(data.map(item => item.Prodi))
        const findProdiNotFound = getProdiFromTemplate.filter(item => !mapProdiFromDb.includes(item))
        if (findProdiNotFound.length > 0) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                code: 'ERR_PRODI_NOT_FOUND',
                message: 'Some prodi(s) couldn\'t be found in database',
                data: findProdiNotFound
            })
        }

        // jenis validation
        const findInvalidJenisValue = data.filter(item => {
            if(item.Jenis == 'B' || item.Jenis == 'R') return false
            return true
        }).map(item => `No. ${item.No}`)
        if (findInvalidJenisValue.length > 0) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                code: 'ERR_JENIS_INVALID',
                message: `'Jenis' invalid, must be 'B' for beasiswa or 'R' for reguler`,
                data: findInvalidJenisValue
            })
        }

        // status validation
        const findInvalidStatusValue = data.filter(item => {
            switch (item.Status) {
                case 'A':
                case 'O':
                case 'D':
                case 'E':
                    return false
                default:
                    return true
            }
        }).map(item => `No. ${item.No}`)

        if (findInvalidStatusValue.length > 0) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                code: 'ERR_STATUS_INVALID',
                message: `Status invalid, must be 'A' for aktif, 'O' for alumni, D for dropout or 'E' for lainnya`,
                data: findInvalidStatusValue
            })
        }

        // inserting or updating
        const dataList = data.map(item => {
            const getStatus = () => {
                switch (item.Status) {
                    case 'A':
                        return 'aktif'
                    case 'O':
                        return 'alumni'
                    case 'D':
                        return 'dropout'
                    case 'D':
                        return 'lainnya'
                }
            }

            const findByCode = (query, field) => query.find(item => item.kode == field)

            return {
                NIS: item.NIS.toString(),
                nama_depan: item["Nama depan"],
                nama_belakang: item["Nama belakang"],
                email: item.Email,
                password: createPassword(item["Kata sandi"]),
                status: getStatus(),
                kelas: findByCode(getAllClassCodeFromDb, item.Kelas).id,
                prodi: findByCode(getAllProdiCodeFromDb, item.Prodi).id,
                tahun_masuk: findByCode(getAllClassCodeFromDb, item.Kelas).angkatan
            }
        })
        const listToUpdate = dataList.filter(item => mapNISFromDb.includes(item.NIS)).map(item => {
            let { email, ...rest } = item
            return rest
        })
        const listToInsert = dataList.filter(item => !mapNISFromDb.includes(item.NIS))
        const inserting = await db(STUDENT_DB).insert(listToInsert)
        const updating = listToUpdate.map(async(item) => {
            await db(STUDENT_DB).update(item).where('NIS',item.NIS)
            return item
        })

        return res.json({
            success:true,
            data: {
                inserting,
                updating
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    studentUpload
}

