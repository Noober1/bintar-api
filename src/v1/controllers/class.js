const express = require('express');
const httpStatus = require('http-status');
const cache = require('../../../lib/cache');
const constants = require('../constants');
const { classAngkatan } = require('../middlewares');
const { checkPageAndLimit } = require('../utils');
const router = express.Router()
const { withAuthToken } = require('../utils/useJWT');

const sendErrorObject = {
    status:httpStatus.FORBIDDEN,
    message: constants.FORBIDDEN.text,
    code: constants.FORBIDDEN.code,
}

const _allowAdmin = (req,res,next) => {
    if (req.auth.accountType == 'admin') {
        next()
    } else {
        throw new sendError(sendErrorObject)
    }
}

router
    .route('/')
    .get(
        withAuthToken,
        _allowAdmin,
        checkPageAndLimit,
        cache.routeJSON(),
        classAngkatan.getClass
    )
    .delete(
        withAuthToken,
        _allowAdmin,
        classAngkatan.deleteClassByIds
    )

router
    .route('/:id')
    .get(
        withAuthToken,
        _allowAdmin,
        classAngkatan.getClassById
    )

module.exports = router