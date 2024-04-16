const express = require('express')
const router = express.Router()
const Product = require('../dao/Models/Product')

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1
        const sort = req.query.sort || null
        const query = req.query.query || ''
        const category = req.query.category || ''
        const available = req.query.available || ''

        let filter = {}
        let sortOptions = {}

        if (category) {
            filter.category = category
        }

        if (available) {
            filter.available = available === 'true'
        }

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }

        if (sort && (sort === 'asc' || sort === 'desc')) {
            sortOptions = { price: sort === 'asc' ? 1 : -1 }
        }

        const totalProducts = await Product.countDocuments(filter)
        const totalPages = Math.ceil(totalProducts / limit)

        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)

        const hasNextPage = page < totalPages
        const hasPrevPage = page > 1

        const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}&category=${category}&available=${available}` : null
        const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}&category=${category}&available=${available}` : null

        const result = {
            status: 'success',
            payload: products,
            totalPages,
            prevPage: page - 1,
            nextPage: page + 1,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        }

        res.status(200).json(result)
    } catch (error) {
        console.error('Ocurrio un error al obtener los productos:', error)
        res.status(500).json({ status: 'error', error: 'Error del servidor' })
    }
})

router.get('/:pid', async (req, res) => {
    const productId = req.params.pid
    try {
        const product = await Product.findById(productId)
        if (product) {
            res.json(product)
        } else {
            res.status(404).json({ error: 'El producto no fue encontrado' })
        }
    } catch (error) {
        console.error('Ocurrió un error al obtener el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Hay campos obligatorios faltantes' })
    }

    try {
        const newProduct = new Product({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails
        })
        await newProduct.save();
        res.status(201).json({ message: 'El producto fue agregado correctamente', product: newProduct })
    } catch (error) {
        console.error('Ocurrió un error al agregar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.put('/:pid', async (req, res) => {
    const productId = req.params.pid
    const { title, description, code, price, stock, category, thumbnails, status } = req.body

    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails,
            status
        }, { new: true })
        res.json({ message: 'El producto fue actualizado correctamente', product: updatedProduct })
    } catch (error) {
        console.error('Ocurrió un error al actualizar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid

    try {
        await Product.findByIdAndDelete(productId);
        res.json({ message: 'El producto fue eliminado correctamente' })
    } catch (error) {
        console.error('Ocurrio un error al eliminar el producto:', error)
        res.status(500).json({ error: 'Error del servidor' })
    }
})

module.exports = router
