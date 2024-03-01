const express = require('express')
const ProductManager = require('./Desafio3') //Desafio3 es ProductManager

const app = express()
const productManager = new ProductManager('products.json')

app.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit)
        let products = await productManager.getProducts()
        
        if (!isNaN(limit)) {
            products = products.slice(0, limit)
        }
        
        res.json(products)
    } catch (error) {
        console.error('Error al obtener productos:', error)
        res.end('Error al obtener productos')
    }
})

app.get('/products/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid)
    try {
        const product = await productManager.getProductById(productId)
        if (product) {
            res.json(product)
        } else {
            res.end('Producto no encontrado')
        }
    } catch (error) {
        console.error('Error al obtener producto por ID:', error)
        res.end('Error al obtener producto por ID')
    }
})

app.listen(8080, () => {
    console.log("El servidor esta listo")
})

