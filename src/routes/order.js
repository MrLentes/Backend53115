const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')

router.get('/confirmation/:orderId', orderController.getOrderConfirmation)
router.get('/:orderId', orderController.getOrderDetails)

module.exports = router