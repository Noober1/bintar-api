const { sendError } = require(".")
const jwt = require('jsonwebtoken')

const authToken = (req,res,next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            throw new sendError({
                status:400,
                code: 'INVALID_AUTH_TOKEN',
                message: 'Auth token value invalid'
            })
        }

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (error,data) => {
            if (error) {
                throw new sendError({
                    status:403,
                    code: 'UNAUTHORIZED',
                    message: 'Auth token unauthorized'
                })
            }
            
            req.auth = data
            next()
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    authToken
}

