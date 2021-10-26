const express = require('express');
const { authToken } = require('../utils/useJWT');
const router = express.Router()

router
    .route('/')
    .get(
        authToken,
        (req,res,next) =>{
        try {
            return res.json({
                success:true
            })
        } catch (error) {
            next(error)
        }
    })

module.exports = router