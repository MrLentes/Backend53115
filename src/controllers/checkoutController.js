const Cart = require('../models/Cart')
const Order = require('../models/Order')

exports.getCheckoutPage = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        res.render('checkout', { cartItems: cart.items, total: cart.total })
    } catch (error) {
        res.status(500).send('Error retrieving checkout page')
    }
}

exports.completeOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        const order = await Order.create({
            userId: req.user._id,
            items: cart.items,
            total: cart.total,
            shippingAddress: req.body.address,
            paymentMethod: req.body.paymentMethod,
            status: 'Pending',
        })

        await cart.clear()
        res.render('confirmation', { orderNumber: order._id, total: order.total, shippingAddress: order.shippingAddress, status: order.status })
    } catch (error) {
        res.status(500).send('Error completing order')
    }
}