const express = require('express')
const ProductManager = require('./src/ProductManager')

const app = express()
const productManager = new ProductManager('products.json')

const productsRouter = require('./routes/products')
const cartsRouter = require('./routes/carts')

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.listen(8080, () => {
    console.log("El servidor esta listo")
})
