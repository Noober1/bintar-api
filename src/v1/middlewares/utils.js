const express = require('express')
const db = require('../../../lib/db')

const router = express.Router()

router.get('/', async(req,res,next) => {
    try {
        return res.send('hello')
    } catch (error) {
        next(error)
    }
})

module.exports = router