const logger = require('../config/logger')
const Product = require('../dao/Models/Product')
const { CustomError } = require('../middlewares/errorHandler')
const errorDictionary = require('../utils/errorDictionary')

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (error) {
        logger.error('Error getting products:', error)
        res.status(500).send('Server error')
    }
}

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).send('Product not found')
        }
        res.json(product)
    } catch (error) {
        logger.error('Error getting product:', error)
        res.status(500).send('Server error')
    }
}

exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body)
        await newProduct.save()
        res.status(201).json(newProduct)
    } catch (error) {
        logger.error('Error creating product:', error)
        res.status(500).send('Server error')
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!product) {
            return res.status(404).send('Product not found')
        }
        res.json(product)
    } catch (error) {
        logger.error('Error updating product:', error)
        res.status(500).send('Server error')
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            return res.status(404).send('Product not found')
        }
        res.send('Product deleted')
    } catch (error) {
        logger.error('Error deleting product:', error)
        res.status(500).send('Server error')
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}