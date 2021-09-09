const { validationResult } = require('express-validator');
const httpStatus = require('http-status');

function ValidationError(message, data) {
    const error = new Error(message);
    error.data = data
    return error
}

ValidationError.prototype = Object.create(Error.prototype);

const validator = (req,res,next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ValidationError('Validation Error', errors.array())
        }
        
        next()
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.BAD_REQUEST).json({
            message:error.message,
            data:error
        })
    }
}

module.exports = validator