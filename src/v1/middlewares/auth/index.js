const { sendError } = require("../../utils")
const jwt = require('jsonwebtoken')
const db = require('../../../../lib/db')
const Crypto = require('crypto');
const httpStatus = require("http-status");

const getIndex = (req,res,next) => {
    try {
        return res.json({
            success:true,
            message:'this is a static page'
        })
    } catch (error) {
        next(error)
    }
}

const postLogin = async(req,res,next) => {
    try {
        const { username, password, app } = req.body

        if (!username || !password) {
            throw new sendError({
                status:httpStatus.BAD_REQUEST,
                code: 'INVALID_AUTH_DATA',
                message: 'Username nor password not received'
            })
        }

        const encPass = Crypto.createHash('sha1').update(password).digest('hex')
        const getUser = await db('dbusers')
            .select('email','level','hak_akses')
            .where({
                email: username,
                password:encPass
            })
            .first()

        if (!getUser) {
            throw new sendError({
                status:httpStatus.UNAUTHORIZED,
                message: 'Username or password incorrect',
                code: 'WRONG_AUTH'
            })
        }

        const userPermission = JSON.parse(getUser.hak_akses)
        if (getUser.level != 'superuser' && !userPermission.includes(app)) {
            throw new sendError({
                status:httpStatus.FORBIDDEN,
                message:'This acount have no permission for this application',
                code: 'NO_PERMISSION'
            })
        }

        const user = {
            email:getUser.email,
            level:getUser.level,
            permission: JSON.parse(getUser.hak_akses) || []
        }
        
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        return res.json({
            ...user,
            accessToken
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    getIndex,
    postLogin
}