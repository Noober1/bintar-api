const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache')

// Middlewares
const { inventaris, utils } = require('../middlewares');
const { validationHandler,checkPageAndLimit, validatorRules } = require('../utils');

router
	.route('/')
	.get(cache.routeJSON(), inventaris.inventarisIndex)

router
	.post('/auth',inventaris.loginAuth)

// Data barang
router
	.route('/item')
	.get(checkPageAndLimit,inventaris.getAllBarang)
	.post(
		validatorRules.item(),
		validationHandler,
		inventaris.postBarang
	)

router
	.route('/item/:id')
	.get(cache.routeJSON(),inventaris.getBarangById)
	.put(inventaris.putBarangById)

router
	.route('/item/:id/input')
	.get(checkPageAndLimit,inventaris.getInputByIdBarang)
	.post(
		validatorRules.input(),
		validationHandler,
		inventaris.postInputByIdBarang
	)

router
	.route('/item/:id/output')
	.get(checkPageAndLimit,inventaris.getOutputByIdBarang)

router
	.route('/item/:id/audit')
	.get(checkPageAndLimit,inventaris.getAuditByIdBarang)

// Data kategori barang
router
	.route('/category')
	.get(cache.routeJSON(),inventaris.getCategory)

router
	.route('/category/:id')
	.get(cache.routeJSON(),inventaris.getCategoryById)

// Data divisi
router
	.route('/division')
	.get(cache.routeJSON(),inventaris.getDivision)

router
	.route('/division/:id')
	.get(cache.routeJSON(),inventaris.getDivisionById)

// Data gudang penyimpanan
router
	.route('/warehouse')
	.get(cache.routeJSON(),inventaris.getWarehouse)

router
	.route('/warehouse/:id')
	.get(cache.routeJSON(),inventaris.getWarehouseById)

// Data input barang
router
	.route('/input')
	.get(checkPageAndLimit,inventaris.getInput)

router
	.route('/input/:id')
	.get(checkPageAndLimit,inventaris.getInputById)
	.put(
		validatorRules.input(),
		validationHandler,
		inventaris.putInputById
	)

// Data output barang
router
	.route('/output')
	.get(checkPageAndLimit,inventaris.getOutput)

router
	.route('/output/:id')
	.get(checkPageAndLimit,inventaris.getOutputById)

// Utils
router
	.use(utils)

module.exports = router