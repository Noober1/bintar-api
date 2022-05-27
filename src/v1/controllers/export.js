const express = require('express');
const router = express.Router()
const { exporting } = require('../middlewares');

router.get('/administrasi/student/:nis', exporting.adminByStudent)

router.get('/administrasi/payment/:id', exporting.adminByPayment)

module.exports = router