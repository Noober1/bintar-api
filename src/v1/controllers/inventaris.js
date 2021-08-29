const express = require('express')
const { inventaris, checkPageAndLimit } = require('../middlewares')

const router = express.Router()

router
	.route('/')
	.get((req,res) => {
		return res.json({
			test:'hello'
		})
	})

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

// Data kategori barang
router
	.route('/category')
	.get(inventaris.getCategory)

router
	.route('/category/:id')
	.get(inventaris.getCategoryById)

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

module.exports = router