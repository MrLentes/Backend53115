const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./src/config/passportConfig');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { generateMockProducts } = require('./src/utils/mocking');
const { errorHandler } = require('./src/middlewares/errorHandler');
const Product = require('./src/dao/models/Product');

const MONGODB_URI = 'mongodb+srv://ValverdeJose:coderpass@cluster0.bheplaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('La conexión a MongoDB Atlas fue exitosa');
}).catch((error) => {
    console.error('Ocurrió un error al conectar a MongoDB Atlas:', error);
    process.exit(1);
});

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: MONGODB_URI, ttl: 24 * 60 * 60 }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/users', userRoutes);

app.get('/mockingproducts', (req, res) => {
    const mockProducts = generateMockProducts();
    res.json(mockProducts);
});

app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('home', { products });
    } catch (error) {
        console.error('Ocurrió un error al obtener los productos:', error);
        res.status(500).send('Error del servidor');
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Ocurrió un error al obtener los productos:', error);
        res.status(500).send('Error del servidor');
    }
});

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    socket.on('createProduct', async (productData) => {
        try {
            const newProduct = await Product.create(productData);
            io.emit('productCreated', newProduct);
        } catch (error) {
            console.error('Ocurrió un error al crear el producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId);
            io.emit('productDeleted', productId);
        } catch (error) {
            console.error('Ocurrió un error al eliminar el producto:', error);
        }
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})