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
      const { name, price, description } = req.body
      const user = req.user
  
      if (user.role !== 'premium' && user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permiso para crear productos' })
      }
  
      const newProduct = new Product({
        name,
        price,
        description,
        owner: user.role === 'premium' ? user._id : 'admin'
      })
  
      await newProduct.save()
      res.status(201).json({ message: 'Producto creado con éxito', product: newProduct })
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el producto', error })
    }
  }

  exports.updateProduct = async (req, res) => {
    try {
      const productId = req.params.id
      const user = req.user
  
      const product = await Product.findById(productId)
  
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' })
      }
  
      if (user.role === 'admin' || (user.role === 'premium' && product.owner.toString() === user._id.toString())) {
        Object.assign(product, req.body)
        await product.save()
        return res.status(200).json({ message: 'Producto actualizado exitosamente', product })
      } else {
        return res.status(403).json({ message: 'No tienes permiso para modificar este producto' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el producto', error })
    }
  }

exports.deleteProduct = async (req, res) => {
    try {
      const productId = req.params.id
      const user = req.user
  
      const product = await Product.findById(productId)
  
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' })
      }
  
      if (user.role === 'admin' || (user.role === 'premium' && product.owner.toString() === user._id.toString())) {
        await product.remove()
        return res.status(200).json({ message: 'Producto eliminado exitosamente' })
      } else {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este producto' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto', error })
    }
  }

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}