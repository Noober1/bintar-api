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
    .delete(
        withAuthToken,
        administrasi.payment.deletePayment
    )

router
    .route('/payment/:id')
    .get(
        withAuthToken,
        _allowAdmin,
        administrasi.payment.getPaymentById
    )

router
    .route('/payment/:id/invoices')
    .get(
        withAuthToken,
        _allowAdmin,
        checkPageAndLimit,
        administrasi.payment.getInvoicesByPaymentId
    )

module.exports = router