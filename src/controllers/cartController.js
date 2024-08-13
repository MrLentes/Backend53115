const logger = require('../config/logger')
const Cart = require('../dao/Models/Cart')
const Product = require('../dao/Models/Product')
const User = require('../dao/Models/User')
const { CustomError } = require('../middlewares/errorHandler')
const errorDictionary = require('../utils/errorDictionary')

exports.createCart = async (req, res) => {
    try {
        const cart = new Cart({ products: [] })
        await cart.save()
        res.status(201).json(cart)
    } catch (error) {
        logger.error('Error creating cart:', error)
        res.status(500).send('Server error')
    }
}

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id).populate('products.product')
        if (!cart) {
            return res.status(404).send('Cart not found')
        }
        res.json(cart)
    } catch (error) {
        logger.error('Error getting cart:', error)
        res.status(500).send('Server error')
    }
}

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body
        const cart = await Cart.findById(req.params.id)
        if (!cart) {
            return res.status(404).send('Cart not found')
        }
        
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send('Product not found')
        }

        const user = await User.findById(req.user._id) 

        if (user.role === 'premium' && product.owner.toString() === user._id.toString()) {
            return res.status(403).send('No puedes agregar a tu carrito un producto que te pertenece.')
        }

        cart.products.push({ product: productId, quantity })
        await cart.save()
        res.json(cart)
    } catch (error) {
        logger.error('Error adding to cart:', error)
        res.status(500).send('Server error')
    }
}

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body
        const cart = await Cart.findById(req.params.id)
        if (!cart) {
            return res.status(404).send('Cart not found')
        }
        cart.products = cart.products.filter(item => item.product.toString() !== productId)
        await cart.save()
        res.json(cart)
    } catch (error) {
        logger.error('Error removing from cart:', error)
        res.status(500).send('Server error')
    }
}

module.exports = {
    createCart,
    getCart,
    addToCart,
    removeFromCart
}