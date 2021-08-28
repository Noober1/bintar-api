const express = require('express')

const router = express.Router()

router
	.route('/')
	.get((req,res) => {
		return res.json({
			test:'hello'
		})
	})

router
	.route('/manakutau')
	.get((req,res) => {
		return res.json({
			manakutau:true
		})
	})
	
module.exports = router