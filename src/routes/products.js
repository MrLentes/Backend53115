const express = require('express')
const router = express.Router()
const fs = require('fs')

router.use(express.json())

router.get('/', (req, res) => {
    try {
        const productsData = fs.readFileSync('productos.json')
        const products = JSON.parse(productsData)
        res.json(products)
    } 
    catch (error) {
        console.error('Ocurrio un error al obtener los productos:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
});

router.get('/:pid', (req, res) => {
    const productId = req.params.pid
    try {
        const productsData = fs.readFileSync('productos.json')
        const products = JSON.parse(productsData)
        const product = products.find(p => p.id === productId)
        if (product) {
            res.json(product)
        } else {
            res.status(404).json({ error: 'El producto no fue encontrado' })
        }
    } 
    catch (error) {
        console.error('Ocurrio un error al obtener el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Hay campos obligatorios faltantes' })
    }

    const newId = Math.floor(Math.random() * 1000)

    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };

    try {
        const productsData = fs.readFileSync('productos.json')
        const products = JSON.parse(productsData)

        products.push(newProduct)

        fs.writeFileSync('productos.json', JSON.stringify(products, null, 2))

        res.status(201).json({ message: 'el producto fue agregado correctamente', product: newProduct })
    } 
    catch (error) {
        console.error('Ocurrio un error al agregar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid)
    const { title, description, code, price, stock, category, thumbnails, status } = req.body

    try {
        const productsData = fs.readFileSync('productos.json')
        let products = JSON.parse(productsData)

        const productIndex = products.findIndex(product => product.id === productId)

        if (productIndex === -1) {
            return res.status(404).json({ error: 'El producto no fue encontrado' })
        }

        products[productIndex] = {
            ...products[productIndex],
            title: title || products[productIndex].title,
            description: description || products[productIndex].description,
            code: code || products[productIndex].code,
            price: price || products[productIndex].price,
            stock: stock || products[productIndex].stock,
            category: category || products[productIndex].category,
            thumbnails: thumbnails || products[productIndex].thumbnails,
            status: status !== undefined ? status : products[productIndex].status
        }

        fs.writeFileSync('productos.json', JSON.stringify(products, null, 2))

        res.json({ message: 'El producto fue actualizado correctamente', product: products[productIndex] })
    } 
    catch (error) {
        console.error('Ocurrio un error al actualizar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid)

    try {
        const productsData = fs.readFileSync('productos.json')
        let products = JSON.parse(productsData)

        products = products.filter(product => product.id !== productId)

        fs.writeFileSync('productos.json', JSON.stringify(products, null, 2))

        res.json({ message: 'El producto fue eliminado correctamente' })
    } 
    catch (error) {
        console.error('Error al eliminar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

module.exports = router
