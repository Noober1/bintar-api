const express = require('express');
const { authToken } = require('../utils/useJWT');
const db = require('../../../lib/db');
const { sendError } = require('../utils');
const httpStatus = require('http-status');
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
        }
    )

router
    .route('/profile')
    .get(
        authToken,
        async(req,res,next) =>{
            try {
                const getData = await db('dbusers')
                    .where({
                        email: req.auth.email
                    })
                    .select('nama_depan','nama_belakang','email','level','hak_akses')
                    .first()
                
                if (!getData) {
                    throw new sendError({
                        status:httpStatus.NOT_FOUND,
                        code: 'USER_NOT_FOUND',
                        message: 'Data not found'
                    })
                }

                return res.json({
                    firstName: getData.nama_depan,
                    lastName: getData.nama_belakang,
                    fullName: getData.nama_depan + ' ' + getData.nama_belakang,
                    email: getData.email,
                    level: getData.level,
                    permission: JSON.parse(getData.hak_akses)
                })
            } catch (error) {
                next(error)
            }
        }
    )

module.exports = router