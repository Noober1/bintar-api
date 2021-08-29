const router = require("express").Router()
const { config } = require("../middlewares")

router
    .route('/')
    .get(config.getConfig)

module.exports = router