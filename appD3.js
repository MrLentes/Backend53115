/*const express = require('express')
const ProductManager = require('./src/ProductManager') //Desafio3 es ProductManager

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

//

const express = require('express')
const exphbs = require('express-handlebars')
const http = require('http')
const socketIo = require('socket.io')
const ProductManager = require('./src/ProductManager')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const productManager = new ProductManager('products.json')

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

app.set('views', __dirname + '/views')

app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        res.render('home', { products })
    } catch (error) {
        console.error('Ocurrió un error al obtener los productos:', error)
        res.status(500).send('Error del servidor')
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        res.render('realTimeProducts', { products })
    } catch (error) {
        console.error('Ocurrió un error al obtener los productos:', error)
        res.status(500).send('Error del servidor')
    }
})

io.on('connection', (socket) => {
    console.log('Usuario conectado')

    socket.on('disconnect', () => {
        console.log('Usuario desconectado')
    });

    socket.on('createProduct', async (productData) => {
        try {
            await productManager.addProduct(productData)
            io.emit('productCreated', productData)
        } 
        catch (error) {
            console.error('Ocurrió un error al crear el producto:', error)
        }
    })

    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(productId)
            io.emit('productDeleted', productId)
        } 
        catch (error) {
            console.error('Ocurrió un error al eliminar el producto:', error)
        }
    })
})

const productsRouter = require('./routes/products')
const cartsRouter = require('./routes/carts')
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
*/