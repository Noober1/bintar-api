const { sendError } = require("../src/v1/utils")

const onlyAdmin = (req,res,next) => {
    if (req.auth.accountType == 'admin') {
        next()
    } else {
        throw new sendError(sendErrorObject)
    }
}

module.exports = onlyAdmin