const { dataMapping, sendError } = require("../../utils")
const { dateToISOString, dateToSQLDate } = require('../../../../lib/utils')
const db = require('../../../../lib/db');
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");
const { getMediaByFileName } = require("../../utils/getMedia");

const INVOICE_DB = 'administrasi_invoice'
const ACCOUNT_DB = 'administrasi_rekening'

const postSendReceipt = async(req,res,next) => {
    const { id } = req.params
    const { picture, destinationAccount, transactionDate, accountNumber, sender, refNumber } = req.body
    try {
        const getInvoice = await db(INVOICE_DB).where('id', id).first()
        if (!getInvoice) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                message: 'Invoice not found',
                code: 'ERR_INVOICE_NOT_FOUND'
            })
        }
        const getMedia = await getMediaByFileName(picture)
        if (!getMedia) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Picture not found',
                code: 'ERR_PICTURE_NOT_FOUND'
            })
        } else if (getMedia.jenis !== 'image') {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Picture is not an image',
                code: 'ERR_PICTURE_NOT_IMAGE'
            })
        }
        const getAccount = await db(ACCOUNT_DB).where('no_rekening', destinationAccount).first()
        if (!getAccount) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'Destination account not found',
                code: 'ERR_CODE_NOT_FOUND'
            })
        }
        // converting string transactionDate into ISOstring
        const date = dateToSQLDate(transactionDate)
        console.log('date',date)
        if (!date) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                message: 'transactionDate invalid',
                code: 'ERR_DATE_INVALID'
            })
        }

        const data2insert = {
            status: 'confirming',
            jenis_pembayaran: 'transfer',
            tanggal_transaksi: date,
            no_rekening: accountNumber,
            tujuan_rekening: destinationAccount,
            nomor_ref: refNumber,
            pembayar: sender,
            gambar: picture
        }

        const inserting = await db(INVOICE_DB).where('id', id).update(data2insert)
        return res.json({
            success:true,
            result: inserting
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    postSendReceipt
}