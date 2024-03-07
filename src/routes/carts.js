const express = require('express')
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

module.exports = router
