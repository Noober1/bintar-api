const express = require('express');
const { student } = require('../middlewares');
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
        student.getStudent
    )
    .post(
        withAuthToken,
        _allowAdmin,
        validatorRules.student(),
        validationHandler,
        student.postStudent
    )
    .delete(
        withAuthToken,
        _allowAdmin,
        student.deleteStudent
    )

router
    .route('/:id')
    .get(
        withAuthToken,
        _allowAdmin,
        student.getStudentById
    )

module.exports = router