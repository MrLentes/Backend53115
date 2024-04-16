/*const express = require('express')
const fs = require('fs')
const router = express.Router()

const cartsFilePath = './carts.json'

const errorHandler = (res, error) => {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error del servidor' })
}

router.get('/', (req, res) => {
    fs.readFile(cartsFilePath, 'utf8', (err, data) => {
        if (err) {
            errorHandler(res, err)
            return
        }
        res.json(JSON.parse(data))
    })
})

router.get('/:cid', (req, res) => {
    const cartId = req.params.cid
    fs.readFile(cartsFilePath, 'utf8', (err, data) => {
        if (err) {
            errorHandler(res, err)
            return
        }

        const carts = JSON.parse(data)
        const cart = carts.find(cart => cart.id === cartId)

        if (cart) {
            res.json(cart)
        } else {
            res.status(404).json({ error: 'El carrito no fue encontrado' })
        }
    })
})

router.post('/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    fs.readFile(cartsFilePath, 'utf8', (err, data) => {
        if (err) {
            errorHandler(res, err)
            return;
        }
        const carts = JSON.parse(data)
        const cartIndex = carts.findIndex(cart => cart.id === cartId)
        if (cartIndex !== -1) {
            fs.writeFile(cartsFilePath, JSON.stringify(carts), err => {
                if (err) {
                    errorHandler(res, err)
                    return
                }
                res.json(carts[cartIndex])
            })
        } else {
            res.status(404).json({ error: 'El carrito no fue encontrado' })
        }
    })
})

module.exports = router*/

//Nuevo codigo

const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const Cart = require('../dao/Models/Cart')

//const ProductManager = require('./ProductManager')

const cartsFilePath = './carts.json'
const productManager = new ProductManager('products.json')

const errorHandler = (res, error) => {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error del servidor' })
}

router.post('/', async (req, res) => {
    try {
        const newId = Math.floor(Math.random() * 1000)
        
        const newCart = {
            id: newId,
            products: []
        }
        
        const data = await fs.readFile(cartsFilePath, 'utf8')
        const carts = JSON.parse(data)
        
        carts.push(newCart)
        
        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2))
        
        res.status(201).json({ message: 'El carrito fue creado correctamente', cart: newCart })
    } catch (error) {
        errorHandler(res, error)
    }
})

router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(cartsFilePath, 'utf8')
        res.json(JSON.parse(data))
    } catch (error) {
        errorHandler(res, error)
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid
    try {
        const data = await fs.readFile(cartsFilePath, 'utf8')
        const carts = JSON.parse(data)
        const cart = carts.find(cart => cart.id === cartId)
        if (cart) {
            res.json(cart)
        } else {
            res.status(404).json({ error: 'El carrito no fue encontrado' })
        }
    } catch (error) {
        errorHandler(res, error)
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    try {
        const product = await productManager.getProductById(productId)
        if (!product) {
            return res.status(404).json({ error: 'El producto no fue encontrado' })
        }
        let data = await fs.readFile(cartsFilePath, 'utf8')
        const carts = JSON.parse(data)
        const cartIndex = carts.findIndex(cart => cart.id === cartId)
        if (cartIndex !== -1) {
            const existingProductIndex = carts[cartIndex].products.findIndex(p => p.id === productId)
            if (existingProductIndex !== -1) {
                carts[cartIndex].products[existingProductIndex].quantity++
            } else {
                carts[cartIndex].products.push({ id: productId, quantity: 1 })
            }
            await fs.writeFile(cartsFilePath, JSON.stringify(carts))
            res.json(carts[cartIndex])
        } else {
            res.status(404).json({ error: 'El carrito no fue encontrado' })
        }
    } catch (error) {
        errorHandler(res, error)
    }
});

module.exports = router;
