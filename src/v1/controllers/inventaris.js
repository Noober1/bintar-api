const express = require('express')
const router = express.Router()

// Middlewares
const { inventaris, checkPageAndLimit, utils } = require('../middlewares')


router
	.route('/')
	.get(inventaris.inventarisIndex)

router
	.post('/auth',inventaris.loginAuth)

// Data barang
router
	.route('/item')
	.get(checkPageAndLimit,inventaris.getAllBarang)

router
	.route('/item/:id')
	.get(inventaris.getBarangById)

router
	.route('/item/:id/input')
	.get(checkPageAndLimit,inventaris.getInputByIdBarang)

router
	.route('/item/:id/output')
	.get(checkPageAndLimit,inventaris.getOutputByIdBarang)

router
	.route('/item/:id/audit')
	.get(checkPageAndLimit,inventaris.getAuditByIdBarang)

// Data kategori barang
router
	.route('/category')
	.get(inventaris.getCategory)

router
	.route('/category/:id')
	.get(inventaris.getCategoryById)

// Data divisi
router
	.route('/division')
	.get(inventaris.getDivision)

router
	.route('/division/:id')
	.get(inventaris.getDivisionById)

// Data input barang
router
	.route('/input')
	.get(checkPageAndLimit,inventaris.getInput)

router
	.route('/input/:id')
	.get(checkPageAndLimit,inventaris.getInputById)

// Data output barang
router
	.route('/output')
	.get(checkPageAndLimit,inventaris.getOutput)

router
	.route('/output/:id')
	.get(checkPageAndLimit,inventaris.getOutputById)

// Utils

router
	.use('/utils', utils)

module.exports = router