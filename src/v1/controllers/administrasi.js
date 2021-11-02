const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache');
const { administrasi } = require('../middlewares');
const { withAuthToken } = require('../utils/useJWT');

const { validationHandler,checkPageAndLimit, validatorRules } = require('../utils');
const { route } = require('./auth');

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
        checkPageAndLimit,
        administrasi.getPayment
    )
    
module.exports = router