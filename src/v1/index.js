'use strict'
const express = require('express')
const router = express.Router()

const { inventaris, config, auth, user, media, administrasi } = require('./controllers')

router.get('/', (req,res) => {
	return res.json({
		environment:process.env.NODE_ENV
	})
})

//controller untuk auth
router.use('/auth', auth)

//controller untuk auth
router.use('/user', user)

//controller untuk configurasi SAS
router.use('/config', config)

//controller untuk inventaris
router.use('/inventaris', inventaris)

//controller untuk administrasi
router.use('/administrasi', administrasi)

//controller untuk media
router.use('/media', media)

module.exports = router