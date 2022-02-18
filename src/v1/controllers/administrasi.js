const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache');
const { administrasi } = require('../middlewares');
const { withAuthToken } = require('../utils/useJWT');

const { validationHandler,checkPageAndLimit, validatorRules } = require('../utils');

const _allowAdmin = (req,res,next) => {
    if (req.auth.accountType == 'admin') {
        next()
    } else {
        throw new sendError(sendErrorObject)
    }
}

router
    .route('/')
    .get((req,res,next) =>{
        try {
            return res.json({
                page:'administration'
            })
        } catch (error) {
            next(error)
        }
    })

router
    .route('/payment')
    .get(
        withAuthToken,
        _allowAdmin,
        checkPageAndLimit,
        administrasi.payment.getPayment
    )
    .post(
        withAuthToken,
        _allowAdmin,
        validatorRules.payment(),
        validationHandler,
        administrasi.payment.postPayment
    )
    .delete(
        withAuthToken,
        administrasi.payment.deletePayment
    )

router
    .route('/payment/:id')
    .get(
        administrasi.payment.getPaymentById
    )
    .patch(
        withAuthToken,
        _allowAdmin,
        validatorRules.payment('edit'),
        validationHandler,
        administrasi.payment.updatePaymentById
    )

router
    .route('/payment/:id/invoices')
    .get(
        withAuthToken,
        _allowAdmin,
        checkPageAndLimit,
        administrasi.payment.getInvoicesByPaymentId
    )
    .post(
        withAuthToken,
        _allowAdmin,
        checkPageAndLimit,
        administrasi.payment.postBatchInvoice
    )

// invoice
router
    .route('/invoice')
    .get(
        withAuthToken,
        checkPageAndLimit,
        administrasi.invoice.getInvoice
    )
    .delete(
        withAuthToken,
        _allowAdmin,
        administrasi.invoice.deleteInvoiceById
    )

router
    .route('/getInvoice')
    .get(
        administrasi.invoice.getInvoiceByQueryCode
    )
    .patch(
        withAuthToken,
        _allowAdmin,
        administrasi.invoice.patchInvoiceByQueryCode
    )

// account
router
    .route('/account')
    .get(
        checkPageAndLimit,
        administrasi.account.getAccount
    )

// receipt
router
    .route('/receipt/:id/send')
    .post(
        withAuthToken,
        validatorRules.receipt(),
        validationHandler,
        administrasi.receipt.postSendReceipt
    )

module.exports = router