const express = require('express');
const { classAngkatan } = require('../middlewares');
const { checkPageAndLimit } = require('../utils');
const router = express.Router()
const { withAuthToken } = require('../utils/useJWT');

router
    .route('/')
    .get(
        checkPageAndLimit,
        classAngkatan.getClass
    )

module.exports = router