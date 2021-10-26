const express = require('express');
const router = express.Router()
const { getIndex, postLogin } = require('../middlewares/auth')

router
    .route('/')
    .get(getIndex)

router
    .route('/login')
    .post(
        postLogin
    )

module.exports = router