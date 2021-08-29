'use strict'

const express = require('express')

const router = express.Router()

const { inventaris, config } = require('./controllers')

router.get('/', (req,res) => {
	return res.json({
		environment:process.env.NODE_ENV
	})
})

//controller untuk configurasi SAS
router.use('/config', config)

//controller untuk inventaris
router.use('/inventaris', inventaris)

module.exports = router