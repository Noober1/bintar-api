const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache');
const { administrasi } = require('../middlewares');
const { authToken } = require('../utils/useJWT');

const { validationHandler,checkPageAndLimit, validatorRules } = require('../utils');

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
    .route('/student')
    .get(
        authToken,
        checkPageAndLimit,
        administrasi.getStudent
    )

module.exports = router