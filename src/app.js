const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const http = require('http')
const socketIo = require('socket.io')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('./src/config/passportConfig')
const authRoutes = require('./src/routes/authRoutes')
const productRoutes = require('./src/routes/productRoutes')
const cartRoutes = require('./src/routes/cartRoutes')
const userRoutes = require('./src/routes/userRoutes')
const checkoutRoutes = require('./routes/checkout')
const orderRoutes = require('./routes/orders')
const { generateMockProducts } = require('./src/utils/mocking')
const { errorHandler } = require('./src/middlewares/errorHandler')
const Product = require('./src/dao/models/Product')
const logger = require('./src/config/logger')
const setupSwaggerDocs = require('./src/config/swaggerConfig')
const bodyParser = require('body-parser')
const path = require('path')

const MONGODB_URI = 'mongodb+srv://ValverdeJose:coderpass@cluster0.bheplaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    logger.log('La conexión a MongoDB Atlas fue exitosa')
}).catch((error) => {
    logger.error('Ocurrió un error al conectar a MongoDB Atlas:', error)
    process.exit(1);
})

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/src/views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: MONGODB_URI, ttl: 24 * 60 * 60 }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/carts', cartRoutes)
app.use('/users', userRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/orders', orderRoutes)

app.get('/mockingproducts', (req, res) => {
    const mockProducts = generateMockProducts()
    res.json(mockProducts)
})

app.get('/', (req, res) => {
    res.redirect('/products');
})

app.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        res.render('home', { products })
    } catch (error) {
        logger.error('Ocurrió un error al obtener los productos:', error)
        res.status(500).send('Error del servidor')
    }
})

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find()
        res.render('realTimeProducts', { products })
    } catch (error) {
        logger.error('Ocurrió un error al obtener los productos:', error)
        res.status(500).send('Error del servidor')
    }
})

io.on('connection', (socket) => {
    logger.log('Usuario conectado')

    socket.on('disconnect', () => {
        logger.log('Usuario desconectado')
    })

    socket.on('createProduct', async (productData) => {
        try {
            const newProduct = await Product.create(productData)
            io.emit('productCreated', newProduct)
        } catch (error) {
            logger.error('Ocurrió un error al crear el producto:', error)
        }
    })

    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId)
            io.emit('productDeleted', productId)
        } catch (error) {
            logger.error('Ocurrió un error al eliminar el producto:', error)
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
    req.logout();
    res.redirect('/login');
})

app.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, cart } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ first_name, last_name, email, age, password: hashedPassword, cart })
        logger.info('Usuario registrado correctamente', newUser)
        res.send('Usuario registrado correctamente')
    } catch (error) {
        logger.error('Error al registrar usuario:', error)
        res.status(500).send('Error del servidor')
    }
})

app.get('/loggerTest', (req, res) => {
    logger.debug('Debug log')
    logger.http('HTTP log')
    logger.info('Info log')
    logger.warn('Warning log')
    logger.error('Error log')
    logger.fatal('Fatal log')
    res.send('Logs generados, revisa la consola y el archivo errors.log')
})

setupSwaggerDocs(app)

app.use(errorHandler)

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    logger.log(`Servidor escuchando en el puerto ${PORT}`)
})