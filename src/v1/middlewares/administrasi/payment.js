const { sendError, dataMapping } = require("../../utils")
const db = require('../../../../lib/db');
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");

const PAYMENT_DB = 'administrasi_pembayaran'
const USER_DB = 'dbusers'
const INVOICE_DB = 'administrasi_invoice'

const getPayment = async(req,res,next) => {
    try {
        const getData = await db(PAYMENT_DB)
            .innerJoin(USER_DB, function () {
                this.on(PAYMENT_DB + '.admin','=',USER_DB + '.email')
            })
            .select([
                PAYMENT_DB + '.id',
                PAYMENT_DB + '.tanggal',
                PAYMENT_DB + '.admin',
                PAYMENT_DB + '.jenis',
                PAYMENT_DB + '.nominal',
                PAYMENT_DB + '.deskripsi',
                USER_DB + '.nama_depan as admin_nama_depan',
                USER_DB + '.nama_belakang as admin_nama_belakang',
                USER_DB + '.email as admin_email',
            ])
            .orderBy('tanggal', 'desc')
            .paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.payment)

        return res.json(getData)
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

module.exports = {
    getPayment,
    deletePayment
}