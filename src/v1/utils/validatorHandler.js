const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const sendError = require('./sendError');

const validator = (req,res,next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new sendError({
                status:400,
                message:'Validation Error',
                code: 'VALIDATION_ERROR',
                data: errors.array()
            })
        }
        
        next()
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message:error.message,
            code:error.code,
            data:error.data
        })
    }
}

module.exports = validator