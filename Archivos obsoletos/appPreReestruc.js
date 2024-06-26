const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const http = require('http')
const socketIo = require('socket.io')
// require('dotenv').config()
const session = require('express-session')
const MongoStore = require('connect-mongo')
const productsRouter = require('./routes/products')
const cartsRouter = require('./routes/carts')
const usersRouter = require('./routes/users')
const Product = require('./dao/Models/Product')
const Cart = require('./dao/Models/Cart')
const User = require('./dao/Models/User')
const bcrypt = require('bcrypt')
const passport = require('./config/passportConfig')

const MONGODB_URI = 'mongodb+srv://ValverdeJose:coderpass@cluster0.bheplaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('La conexión a MongoDB Atlas fue exitosa')
}).catch((error) => {
    console.error('Ocurrio un error al conectar a MongoDB Atlas:', error)
    process.exit(1)
})

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: MONGODB_URI, ttl: 24 * 60 * 60 }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/users', usersRouter)

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash;
    } catch (error) {
        console.error('Error al hashear la contraseña:', error)
        throw new Error('Error al hashear la contraseña')
    }
}

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
    })

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

app.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/auth/github', passport.authenticate('github'))

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/products')
    })

app.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

app.post('/register', async (req, res) => {
  try {
      const { first_name, last_name, email, age, password, cart } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await User.create({ first_name, last_name, email, age, password: hashedPassword, cart })
      res.send('Usuario registrado correctamente')
  } catch (error) {
      console.error('Error al registrar usuario:', error)
      res.status(500).send('Error del servidor')
  }
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
