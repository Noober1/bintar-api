'use strict'
const express = require('express')
const router = express.Router()

const {
	inventaris,
	config,
	auth,
	user,
	media,
	administrasi,
	student,
	classAngkatan,
	prodi,
	template
} = require('./controllers')

router.get('/', (req,res) => {
	return res.json({
		environment:process.env.NODE_ENV
	})
})

//controller untuk auth
router.use('/auth', auth)

//controller untuk configurasi SAS
router.use('/config', config)

//controller untuk auth
router.use('/user', user)

//controller untuk student
router.use('/student', student)

//controller untuk class
router.use('/class', classAngkatan)

//controller untuk class
router.use('/prodi', prodi)

//controller untuk inventaris
router.use('/inventaris', inventaris)

//controller untuk administrasi
router.use('/administrasi', administrasi)

//controller untuk media
router.use('/media', media)

// controller untup upload(template upload?)
router.use('/template', template)

module.exports = router