const express = require('express');
const { user } = require('../middlewares');
const { authToken } = require('../utils/useJWT');
const router = express.Router()
const { validationHandler, checkPageAndLimit, validatorRules } = require('../utils');

router
    .route('/')
    .get(
        authToken,
        checkPageAndLimit,
        user.getUser
    )

module.exports = router