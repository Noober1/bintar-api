const { sendError, dataMapping, randomString, getDataFromDb, stringReplaceArray } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");
const { INVOICE_DB, STUDENT_DB, INSTALMENT_DB, CLASS_DB, PAYMENT_DB, USER_DB } = require('../../constants')
const MAX_INSTALMENT = process.env.MAX_CICILAN || 6

const _getPaymentHistory = code => {
    return db(INSTALMENT_DB).where(INSTALMENT_DB + '.invoice', code).orderBy(INSTALMENT_DB + '.tanggal_transaksi','DESC')
}

const getInvoice = async(req,res,next) => {
    var { search:searchInvoice } = req.query
    try {
        let queryGetData = db(INVOICE_DB)
        .select([
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
        ])
        .innerJoin(STUDENT_DB,function () {
            this.on(STUDENT_DB + '.id','=',INVOICE_DB + '.mahasiswa')
        })
        .innerJoin(CLASS_DB, function () {
            this.on(STUDENT_DB + '.kelas','=',CLASS_DB + '.id')
        })
        .orderBy(INVOICE_DB + '.tanggal_invoice', 'DESC')

        if (req.auth.accountType == 'student') {
            queryGetData = queryGetData.where(STUDENT_DB + '.email', req.auth.email)
        }

        if (searchInvoice) {
            let searchByStatus = '';
            switch (searchInvoice) {
                case 'lunas':
                case 'paid':
                    searchByStatus = 'paid'
                    break;
                case 'pending':
                    searchByStatus = 'pending'
                    break;
                case 'confirming':
                case 'verification':
                case 'verifikasi':
                    searchByStatus = 'confirming'
                    break;
                case 'verifikasi':
                    searchByStatus = 'confirming'
                    break;
                case 'invalid':
                    searchByStatus = 'invalid'
                    break;
                case 'belum lunas':
                case 'unpaid':
                    searchByStatus = 'unpaid'
                    break;
            }
            queryGetData = queryGetData
                .where(INVOICE_DB + '.code','like', `%${searchInvoice}%`)
                .orWhere(STUDENT_DB + '.nama_depan','like',`%${searchInvoice}%`)
                .orWhere(STUDENT_DB + '.nama_belakang','like',`%${searchInvoice}%`)

            if (searchByStatus !== '') {
                queryGetData = queryGetData.orWhere(INVOICE_DB + '.status', searchByStatus)
            }
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

        const getData = await db(INVOICE_DB)
            .select([
                INVOICE_DB + '.id',
                INVOICE_DB + '.code',
                INVOICE_DB + '.status',
                INVOICE_DB + '.jenis_pembayaran',
                INVOICE_DB + '.no_rekening',
                INVOICE_DB + '.tujuan_rekening',
                INVOICE_DB + '.tanggal_invoice',
                INVOICE_DB + '.tanggal_transaksi',
                INVOICE_DB + '.tanggal_verifikasi',
                INVOICE_DB + '.pembayar',
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
                PAYMENT_DB + '.nominal as pembayaran_nominal',
                PAYMENT_DB + '.jenis as pembayaran_jenis',
                PAYMENT_DB + '.deskripsi as pembayaran_deskripsi',
                USER_DB + '.nama_depan as pembayaran_admin_nama_depan',
                USER_DB + '.nama_belakang as pembayaran_admin_nama_belakang',
                USER_DB + '.email as pembayaran_admin_email'
            ])
            .innerJoin(PAYMENT_DB,function () {
                this.on(PAYMENT_DB + '.id','=',INVOICE_DB + '.pembayaran')
            })
            .innerJoin(USER_DB,function () {
                this.on(USER_DB + '.email','=',PAYMENT_DB + '.admin')
            })
            .innerJoin(STUDENT_DB,function () {
                this.on(STUDENT_DB + '.id','=',INVOICE_DB + '.mahasiswa')
            })
            .innerJoin(CLASS_DB, function () {
                this.on(STUDENT_DB + '.kelas','=',CLASS_DB + '.id')
            })
            .where(INVOICE_DB + '.code', code)
            .first()

        if (!getData) {
            throw new sendError({
                status:httpStatus.NOT_FOUND,
                message: "Data not found",
                code: "ERR_DATA_NOT_FOUND"
            })
        }

        getData.cicilan = await _getPaymentHistory(code)

        return res.json(dataMapping.invoiceDetail(getData))
    } catch (error) {
        next(error)
    }
}

const deleteInvoiceById = async(req,res,next) => {
    const { body } = req
    try {
        if (!Array.isArray(body.ids)) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Data given invalid',
                code: 'ERR_DATA_INVALID'
            })
        }

        const deleting = await db(INVOICE_DB)
            .whereIn('id', body.ids)
            .where('status', 'unpaid')
            .del()

        return res.json({
            success:true,
            result: {
                deleted:deleting,
                from:body.ids.length
            }
        })
    } catch (error) {
        next(error)
    }
}

const patchInvoiceByQueryCode = async(req,res,next) => {
    const { code } = req.query
    const { paymentMethod, nominal, payer, invalid, transactionDate } = req.body
    try {
        // if invoice code doesn't received from query
        if (!code) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: "Invoice code invalid",
                code: "ERR_CODE_INVALID"
            })
        }

        // get invoice data with code
        const getDataByQueryCode = await db(INVOICE_DB)
            .select([
                INVOICE_DB + '.id',
                INVOICE_DB + '.code',
                INVOICE_DB + '.mahasiswa',
                INVOICE_DB + '.id',
                INVOICE_DB + '.status',
                INVOICE_DB + '.no_rekening',
                INVOICE_DB + '.pembayar',
                INVOICE_DB + '.pembayaran',
                INVOICE_DB + '.tujuan_rekening',
                INVOICE_DB + '.tanggal_invoice',
                INVOICE_DB + '.tanggal_transaksi',
                INVOICE_DB + '.tanggal_verifikasi',
                INVOICE_DB + '.nomor_ref',
                INVOICE_DB + '.gambar',
                STUDENT_DB + '.email as siswa_email',
                PAYMENT_DB + '.nominal as nominal' 
            ])
            .innerJoin(STUDENT_DB,function () {
                this.on(STUDENT_DB + '.id','=',INVOICE_DB + '.mahasiswa')
            })
            .innerJoin(PAYMENT_DB,function () {
                this.on(PAYMENT_DB + '.id','=',INVOICE_DB + '.pembayaran')
            })
            .where(INVOICE_DB + '.code', code)
            .first()

        if (!getDataByQueryCode) {
            throw new sendError({
                status:httpStatus.NOT_FOUND,
                message: "Data not found",
                code: "ERR_DATA_NOT_FOUND"
            })
        } else if(
            getDataByQueryCode.status == 'paid' ||
            (
                (getDataByQueryCode.status == 'unpaid' || getDataByQueryCode.status == 'pending' || getDataByQueryCode.status == 'invalid') && paymentMethod == 'transfer'
            )
        ) {
            throw new sendError({
                status: httpStatus.FORBIDDEN,
                message: 'Cannot verify / add transaction'
            })
        }

        // get payment history
        const getPaymentHistory = await _getPaymentHistory(code)

        if (getPaymentHistory.length >= MAX_INSTALMENT) {
            throw new sendError({
                status:httpStatus.FORBIDDEN,
                message: "Max instalment reached",
                code: "ERR_MAX_INSTALMENT_REACHED"
            })
        }

        // summarize payment history
        const sumPaymentHistory = getPaymentHistory.reduce((value, item) => value + item.nominal, 0)
        // if payment history summarize result is greater than requirement
        if (sumPaymentHistory > getDataByQueryCode.nominal) {
            throw new sendError({
                status: httpStatus.FORBIDDEN,
                message: "Status paid, cannot add any transaction anymore",
                code: "ERR_INVOICE_HAS_PAID"
            })
        }
        // summarize from payment history and from data request
        const sumCurrentPaymentHistory = sumPaymentHistory + (nominal ? parseInt(nominal) : getDataByQueryCode.nominal)
        // if total payment history(including summarize current payment history), throw error
        if (sumCurrentPaymentHistory > getDataByQueryCode.nominal) {
            throw new sendError({
                status: httpStatus.FORBIDDEN,
                message: "Nominal value offset",
                code: "ERR_VERIVY_NOMINAL_OFFSET"
            })
        }
        // return res.json(getDataByQueryCode)
        const currentDate = new Date()

        if (!invalid) {
            const insertingPaymentHistory = await db(INSTALMENT_DB)
                .insert({
                    invoice: code,
                    admin: req.auth.email,
                    mahasiswa: getDataByQueryCode.siswa_email,
                    pembayar: payer || getDataByQueryCode.pembayar,
                    nominal: nominal || getDataByQueryCode.nominal,
                    metode_pembayaran: paymentMethod == 'manual' ? 'manual' : 'transfer',
                    tanggal_transaksi: paymentMethod == 'manual' ? currentDate : transactionDate ,
                    tanggal_verifikasi: currentDate
                })
        }

        const updating = await db(INVOICE_DB).where(INVOICE_DB + '.code', code).update({
            status: sumCurrentPaymentHistory >= getDataByQueryCode.nominal ? 'paid' : sumCurrentPaymentHistory < getDataByQueryCode.nominal ? 'pending' : invalid ? 'invalid' : 'unpaid',
            jenis_pembayaran: paymentMethod || 'transfer',
            tanggal_verifikasi: currentDate,
            tanggal_transaksi: currentDate
        })

        return res.json({
            success:true,
            result:{
                paymentHistory: typeof insertingPaymentHistory !== 'undefined' ? insertingPaymentHistory : null,
                invoice: updating
            }
        })

        // return res.json({
        //     success:true,
        //     data:updating
        // })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getInvoice,
    getInvoiceByQueryCode,
    deleteInvoiceById,
    patchInvoiceByQueryCode
}