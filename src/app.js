const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const http = require('http')
const socketIo = require('socket.io')
const Product = require('./dao/Models/Product')
const Cart = require('./dao/Models/Cart')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('La conexión a MongoDB Atlas fue exitosa')
}).catch((error) => {
    console.error('Ocurrio un error al conectar a MongoDB Atlas:', error)
    process.exit(1)
})

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

app.use(express.json())

const productsRouter = require('./routes/products')
const cartsRouter = require('./routes/carts')
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.get('/', async (req, res) => {
  try {
      const products = await Product.find()
      res.render('home', { products })
  } catch (error) {
      console.error('Ocurrió un error al obtener los productos:', error)
      res.status(500).send('Error del servidor')
  }
})

app.get('/realtimeproducts', async (req, res) => {
  try {
      const products = await Product.find()
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
      const newProduct = await Product.create(productData)
      io.emit('productCreated', newProduct)
    } catch (error) {
      console.error('Ocurrio un error al crear el producto:', error)
    }
  })

  socket.on('deleteProduct', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId)
      io.emit('productDeleted', productId)
    } catch (error) {
      console.error('Ocurrio un error al eliminar el producto:', error)
    }
  })
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
