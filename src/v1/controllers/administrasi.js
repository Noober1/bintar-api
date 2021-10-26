const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache')

const { validationHandler,checkPageAndLimit, validatorRules } = require('../utils');

router
    .route('/')
    .get((req,res,next) =>{
        try {
            return res.json({
                cookies:req.cookies
            })
        } catch (error) {
            next(error)
        }
    })

module.exports = router