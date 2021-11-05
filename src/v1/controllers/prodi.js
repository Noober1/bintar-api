const express = require('express');
const { prodi } = require('../middlewares');
const { withAuthToken } = require('../utils/useJWT');
const router = express.Router()
const { validationHandler, checkPageAndLimit, validatorRules, sendError } = require('../utils');
const httpStatus = require('http-status');
const constants = require('../constants');

const sendErrorObject = {
    status:httpStatus.FORBIDDEN,
    message: constants.FORBIDDEN.text,
    code: constants.FORBIDDEN.code,
}

router
    .route('/')
    .get(
        withAuthToken,
        checkPageAndLimit,
        prodi.getProdi
    )

module.exports = router