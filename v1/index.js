'use strict'

const express = require('express')

const router = express.Router()

const inventarisController = require('./controllers/inventaris')

router.get('/', (req,res) => {
	return res.json({
		test:'root'
	})
})

router.use('/inventaris', inventarisController)

module.exports = router