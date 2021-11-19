const { sendError, dataMapping, randomString, getDataFromDb, stringReplaceArray } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");

const STUDENT_DB = 'administrasi_mahasiswa'
const INVOICE_DB = 'administrasi_invoice'
const CLASS_DB = 'administrasi_kelas_angkatan'

const _queryGetData = () => db(INVOICE_DB)
    .select(
        INVOICE_DB + '.id',
        INVOICE_DB + '.code',
        INVOICE_DB + '.status',
        INVOICE_DB + '.jenis_pembayaran',
        INVOICE_DB + '.no_rekening',
        INVOICE_DB + '.tujuan_rekening',
        INVOICE_DB + '.tanggal_invoice',
        INVOICE_DB + '.tanggal_transaksi',
        INVOICE_DB + '.tanggal_verifikasi',
        INVOICE_DB + '.nomor_ref',
        INVOICE_DB + '.gambar',
        STUDENT_DB + '.NIS as mahasiswa_NIS',
        STUDENT_DB + '.nama_depan as mahasiswa_nama_depan',
        STUDENT_DB + '.nama_belakang as mahasiswa_nama_belakang',
        STUDENT_DB + '.email as mahasiswa_email',
        STUDENT_DB + '.status as mahasiswa_status',
        STUDENT_DB + '.jenis as mahasiswa_jenis',
        CLASS_DB + '.nama as mahasiswa_kelas_nama',
        CLASS_DB + '.semester as mahasiswa_kelas_semester',
    )
    .innerJoin(STUDENT_DB,function () {
        this.on(STUDENT_DB + '.id','=',INVOICE_DB + '.mahasiswa')
    })
    .innerJoin(CLASS_DB, function () {
        this.on(STUDENT_DB + '.kelas','=',CLASS_DB + '.id')
    })

const getInvoice = async(req,res,next) => {
    try {
        let queryGetData = _queryGetData()
        if (req.auth.accountType == 'student') {
            queryGetData = queryGetData.where(STUDENT_DB + '.email', req.auth.email)
        }

        const getData = await queryGetData.paginate(pagination(req.page,req.limit))

        getData.data = getData.data.map(dataMapping.invoice)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

const getInvoiceByQueryCode = async(req,res,next) => {
    const { code } = req.query
    try {
        if (!code) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Invoice code invalid",
                code: "ERR_CODE_INVALID"
            })
        }

        const getData = await _queryGetData()
            .where(INVOICE_DB + '.code', code)
            .first()

        if (!getData) {
            throw new sendError({
                status:httpStatus.NOT_FOUND,
                message: "Data not found",
                code: "ERR_DATA_NOT_FOUND"
            })
        }

        return res.json(dataMapping.invoice(getData))
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getInvoice,
    getInvoiceByQueryCode
}