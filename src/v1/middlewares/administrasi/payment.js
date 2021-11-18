const { sendError, dataMapping, randomString, stringReplaceArray, getDataFromDb } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");

const PAYMENT_DB = 'administrasi_pembayaran'
const USER_DB = 'dbusers'
const INVOICE_DB = 'administrasi_invoice'
const STUDENT_DB = 'administrasi_mahasiswa'
const CLASS_DB = 'administrasi_kelas_angkatan'
const PAYMENT_SELECT = [
    PAYMENT_DB + '.id',
    PAYMENT_DB + '.tanggal',
    PAYMENT_DB + '.admin',
    PAYMENT_DB + '.jenis',
    PAYMENT_DB + '.nominal',
    PAYMENT_DB + '.deskripsi',
    USER_DB + '.nama_depan as admin_nama_depan',
    USER_DB + '.nama_belakang as admin_nama_belakang',
    USER_DB + '.email as admin_email',
]

const getPayment = async(req,res,next) => {
    try {
        const getData = await db(PAYMENT_DB)
            .innerJoin(USER_DB, function () {
                this.on(PAYMENT_DB + '.admin','=',USER_DB + '.email')
            })
            .select(PAYMENT_SELECT)
            .orderBy('tanggal', 'desc')
            .paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.payment)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

const postPayment = async(req,res,next) => {
    const { admin, type, description, price } = req.body
    try {
        const getUser = await db(USER_DB).where('email', admin).first()
        if (!getUser) {
            throw new sendError({
                status:400,
                message: 'Administrator with email given not found',
                code: 'ERR_ADMIN_NOT_FOUND'
            })
        }

        const inserting = await db(PAYMENT_DB).insert({
            tanggal: new Date(),
            admin: admin,
            jenis: type,
            nominal: price,
            deskripsi: description
        })
        
        return res.json({
            success:true,
            result:inserting
        })
    } catch (error) {
        next(error)
    }
}

const deletePayment = async(req,res,next) => {
    const { ids } = req.body

    try {
        if (!Array.isArray(ids)) {
            throw new sendError({
                status:400,
                message: 'Data given invalid',
                code: 'ERR_DATA_INVALID'
            })
        }

        const id = ids[0]

        const getInvoiceByPaymentId = await db(INVOICE_DB).select('id').where('pembayaran', id).first()
        if (getInvoiceByPaymentId) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Data cannot be deleted because there is an invoice(s)",
                code:"ERR_PAYMENT_HAVE_INVOICE"
            })
        }

        const deleting = await db(PAYMENT_DB).where('id', id).del()
        
        return res.json({
            success:true,
            result: deleting
        })
    } catch (error) {
        next(error)
    }
}

const updatePaymentById = async(req,res,next) => {
    const { type, description } = req.body
    try {
        const updating = await db(PAYMENT_DB).where('id', req.params.id).update({
            jenis: type,
            deskripsi: description
        })

        return res.json({
            success:true,
            result: updating
        })
    } catch (error) {
        next(error)
    }
}

const getPaymentById = async(req,res,next) => {
    try {
        // const getData = await db(PAYMENT_DB).where('id', req.params.id).first()
        const getData = await db(PAYMENT_DB)
            .where(PAYMENT_DB + '.id', req.params.id)
            .innerJoin(USER_DB, function () {
                this.on(PAYMENT_DB + '.admin','=',USER_DB + '.email')
            })
            .select(PAYMENT_SELECT)
            .first()

        if (!getData) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Data not found",
                code: "ERR_DATA_NOT_FOUND"
            })
        }
        
        return res.json(dataMapping.payment(getData))
    } catch (error) {
        next(error)
    }
}

const getInvoicesByPaymentId = async(req,res,next) => {
    try {
        const getPayment = await db(PAYMENT_DB).where('id', req.params.id).first()
        if (!getPayment) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Payment with id given not found',
                code: 'ERR_PAYMENT_NOT_FOUND'
            })
        }

        const getData = await db(INVOICE_DB)
            .innerJoin(STUDENT_DB, function () {
                this.on(INVOICE_DB + '.mahasiswa','=',STUDENT_DB + '.id')
            })
            .innerJoin(CLASS_DB, function () {
                this.on(STUDENT_DB + '.kelas','=',CLASS_DB + '.id')
            })
            .select([
                INVOICE_DB + '.id',
                INVOICE_DB + '.code',
                STUDENT_DB + '.nama_depan as mahasiswa_nama_depan',
                STUDENT_DB + '.nama_belakang as mahasiswa_nama_belakang',
                STUDENT_DB + '.email as mahasiswa_email',
                CLASS_DB + '.nama as mahasiswa_kelas_nama',
                INVOICE_DB + '.status',
                INVOICE_DB + '.jenis_pembayaran',
                INVOICE_DB + '.no_rekening',
                INVOICE_DB + '.tujuan_rekening',
                INVOICE_DB + '.tanggal_invoice',
                INVOICE_DB + '.tanggal_transaksi',
                INVOICE_DB + '.tanggal_verifikasi',
                INVOICE_DB + '.nomor_ref',
                INVOICE_DB + '.gambar',
            ])
            .where(INVOICE_DB + '.pembayaran', req.params.id)
            .paginate(pagination(req.page,req.limit))

        getData.data = getData.data.map(dataMapping.invoice)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

const postBatchInvoice = async(req,res,next) => {
    const { class:classIds, prodi, includeBeasiswa } = req.body
    try {
        if (!classIds || !prodi) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Some data requirement(s) is missing",
                code: "ERR_DATA_MISSING"
            })
        }

        if (!Array.isArray(classIds) || !Array.isArray(prodi)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Data given invalid",
                code: "ERR_DATA_INVALID"
            })
        }

        let queryGetStudent = db(STUDENT_DB)
            .select('id','NIS','email','status','kelas','tahun_masuk','jenis','prodi')
            .where('status','aktif')
            .whereIn('kelas', classIds)

        // if prodi isn't empty, add additional query where prodi
        // is in list of prodi from request body
        if (prodi.length > 0) {
            queryGetStudent = queryGetStudent.whereIn('prodi', prodi)
        }

        // exclude student with type 'beasiswa'. If it so, these student will not
        // receive invoice
        if (!includeBeasiswa) {
            queryGetStudent = queryGetStudent.whereNot('jenis', 'beasiswa')
        }

        const getStudentData = await queryGetStudent

        if (getStudentData.length < 1) {
            return res.status(httpStatus.CREATED).json({
                success:true,
                message: "No data to insert",
                code: "NO_DATA_TO_INSERT"
            })
        }

        // this is for MYSQL query for whereIn in database invoice
        const getStudentIdList = getStudentData.map(item => item.id)

        // find invoice with related payment id AND student id in list
        const getInvoiceByListId = await db(INVOICE_DB)
            .select('mahasiswa')
            .where('pembayaran', req.params.id)
            .whereIn('mahasiswa', getStudentIdList)

        // creating variable invoice student id list
        const studentIdListFromInvoice = getInvoiceByListId.map(item => item.mahasiswa)

        // filtering student data. So, student that already have invoice
        // will be excluded from creating invoices
        const studentList = getStudentData.filter(item => !studentIdListFromInvoice.includes(item.id))

        if (studentList.length < 1) {
            return res.status(httpStatus.CREATED).json({
                success:true,
                message: "No data to insert",
                code: "NO_DATA_TO_INSERT"
            })
        }

        const getConfig = await getDataFromDb()
        const getYear = new Date().getFullYear()

        const data2insert = studentList.map(item => {
            let generatedRandomString = randomString(10).toUpperCase()
            let code = stringReplaceArray(
                getConfig.administrasi_invoice,
                ['[YEAR]','[STUDENT]','[CODE]'],
                [getYear, item.id, generatedRandomString]
            )
            return {
                code,
                mahasiswa: item.id,
                pembayaran: parseInt(req.params.id)
            }
        })

        const inserting = await db(INVOICE_DB).insert(data2insert)

        return res.json({
            success:true,
            result:inserting
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPayment,
    postPayment,
    deletePayment,
    updatePaymentById,
    getPaymentById,
    getInvoicesByPaymentId,
    postBatchInvoice
}