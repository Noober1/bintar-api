const express = require('express');
const { withAuthToken } = require('../utils/useJWT');
const router = express.Router()
const { validationHandler, checkPageAndLimit, validatorRules, sendError } = require('../utils');
const httpStatus = require('http-status');
const constants = require('../constants');
const path = require('path')
const onlyAdmin = require('../../../lib/onlyAdmin');
const fs = require('fs')
const { template } = require('../middlewares');
const multer = require('multer');
const rootDir = require('../../../lib/rootDir');

// file mime whitelist
const whitelist = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
]

// file filter middleware
const fileFilter = (req, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
        return cb(new sendError({
            status: 400,
            code: 'FILE_NOT_ALLOWED',
            message: 'File format not allowed'
        }))
    }
    return cb(null, true)
}

const _uploadMiddleware = multer({
    fileFilter,
    storage: multer.memoryStorage()
})

const _fileChecking = (req, res, next) => {
    try {
        if (typeof req.file == 'undefined') {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                code: 'ERR_FILE_EMPTY',
                message: 'Template file should be uploaded'
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}

router.use(
    // apply upload middleware
    _uploadMiddleware.single('file'),
    withAuthToken,
    onlyAdmin,
    // check if file is exist
    _fileChecking
)

router
    .route('/student')
    .post(template.studentUpload)

module.exports = router