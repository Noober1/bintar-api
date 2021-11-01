const express = require('express');
const { user } = require('../middlewares');
const { withAuthToken } = require('../utils/useJWT');
const db = require('../../../lib/db');
const { sendError } = require('../utils');
const httpStatus = require('http-status');
const router = express.Router()
const { validationHandler, checkPageAndLimit, validatorRules } = require('../utils');

router
    .route('/')
    .get(
        withAuthToken,
        user.getUser
    )

module.exports = router