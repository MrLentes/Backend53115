const express = require('express')
const router = express.Router()
const Cart = require('../dao/Models/Cart')
const Product = require('../dao/Models/Product')

router.post('/', async (req, res) => {
    try {
        const newId = Math.floor(Math.random() * 1000)

        const newCart = new Cart({
            id: newId,
            products: []
        })

        await newCart.save()
        res.status(201).json({ message: 'El carrito fue creado correctamente', cart: newCart })
    } catch (error) {
        console.error('Ocurrio un error al crear el carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
});

router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find()
        res.json(carts)
    } catch (error) {
        console.error('Ocurrio un error al obtener los carritos:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid

    try {
        const cart = await Cart.findById(cartId).populate('products.product')
        if (!cart) {
            return res.status(404).json({ error: 'El carrito no fue encontrado' })
        }

        res.json({ cart })
    } catch (error) {
        console.error('Error al obtener el carrito con productos:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    try {
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: 'El producto no fue encontrado' })
        }

        const cart = await Cart.findOne({ id: cartId })
        if (cart) {
            const existingProduct = cart.products.find(p => p.id === productId)
            if (existingProduct) {
                existingProduct.quantity++
            } else {
                cart.products.push({ id: productId, quantity: 1 })
            }
            await cart.save()
            res.json(cart)
        } else {
            res.status(404).json({ error: 'El carrito no fue encontrado' })
        }
    } catch (error) {
        console.error('Ocurrio un error al agregar producto al carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.delete('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    
    try {
        const cart = await Cart.findById(cartId)
        if (!cart) {
            return res.status(404).json({ error: 'El carrito no fue encontrado' })
        }

        cart.products = cart.products.filter(product => product.product.toString() !== productId)
        await cart.save()

        res.json({ message: 'Producto eliminado del carrito correctamente', cart })
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.put('/:cid', async (req, res) => {
    const cartId = req.params.cid
    const { products } = req.body

    try {
        const cart = await Cart.findById(cartId)
        if (!cart) {
            return res.status(404).json({ error: 'El carrito no fue encontrado' })
        }

        cart.products = products
        await cart.save()

        res.json({ message: 'Carrito actualizado correctamente', cart })
    } catch (error) {
        console.error('Error al actualizar el carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.put('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    const { quantity } = req.body

    try {
        const cart = await Cart.findById(cartId)
        if (!cart) {
            return res.status(404).json({ error: 'El carrito no fue encontrado' })
        }

        const productIndex = cart.products.findIndex(product => product.product.toString() === productId)
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity
            await cart.save();
            res.json({ message: 'Cantidad actualizada correctamente', cart })
        } else {
            res.status(404).json({ error: 'El producto no está en el carrito' })
        }
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.delete('/:cid', async (req, res) => {
    const cartId = req.params.cid

    try {
        const cart = await Cart.findById(cartId)
        if (!cart) {
            return res.status(404).json({ error: 'El carrito no fue encontrado' })
        }

        cart.products = []
        await cart.save()

        res.json({ message: 'Todos los productos fueron eliminados del carrito', cart })
    } catch (error) {
        console.error('Error al eliminar todos los productos del carrito:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})



module.exports = router
