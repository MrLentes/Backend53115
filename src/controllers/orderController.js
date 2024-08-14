const Order = require('../models/Order')

exports.getOrderConfirmation = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
        if (!order) return res.status(404).send('Order not found')
        res.render('confirmation', { orderNumber: order._id, total: order.total, shippingAddress: order.shippingAddress, status: order.status })
    } catch (error) {
        res.status(500).send('Error retrieving order confirmation')
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
        if (!order) return res.status(404).send('Order not found')
        res.render('orderDetails', { orderNumber: order._id, orderDate: order.createdAt, status: order.status, items: order.items, total: order.total, shippingAddress: order.shippingAddress })
    } catch (error) {
        res.status(500).send('Error retrieving order details')
    }
}