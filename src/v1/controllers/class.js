const express = require('express');
const cache = require('../../../lib/cache');
const { classAngkatan } = require('../middlewares');
const { checkPageAndLimit } = require('../utils');
const router = express.Router()
const { withAuthToken } = require('../utils/useJWT');

router
    .route('/')
    .get(
        withAuthToken,
        checkPageAndLimit,
        cache.routeJSON(),
        classAngkatan.getClass
    )

module.exports = router