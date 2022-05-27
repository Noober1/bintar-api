const httpStatus = require("http-status")
const constants = require("../src/v1/constants")
const { sendError } = require("../src/v1/utils")

const sendErrorObject = {
    status:httpStatus.FORBIDDEN,
    message: constants.FORBIDDEN.text,
    code: constants.FORBIDDEN.code,
}

const onlyAdmin = (req,res,next) => {
    if (req.auth.accountType == 'admin') {
        next()
    } else {
        throw new sendError(sendErrorObject)
    }
}

module.exports = onlyAdmin