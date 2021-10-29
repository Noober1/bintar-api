const express = require('express');
const router = express.Router()
const auth = require('../middlewares/auth');
const { withAuthToken } = require('../utils/useJWT');

router
    .route('/login')
    .post(
        auth.postLogin
    )

router
    .route('/profile')
    .get(
        withAuthToken,
        auth.getProfile
    )

module.exports = router