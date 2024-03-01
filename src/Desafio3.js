const fs = require('fs').promises

const Product = {
    create(Id, Title, Description, Price, Thumbnail, Code, Stock) {
        return {
            id: Id,
            title: Title,
            description: Description,
            price: Price,
            thumbnail: Thumbnail,
            code: Code,
            stock: Stock
        }
    }
}

class ProductManager {
    constructor(path) {
        this.path = path
    }

    async addProduct(newProduct) {
        try {
            const products = await this.getProducts()
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
            newProduct.id = newId
            products.push(newProduct)
            await fs.appendFile(this.path, JSON.stringify([newProduct], null, 2) + '\n')
        } catch (error) {
            console.error('Sucedio un error agregando el producto', error)
        }
    }    
    
    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf8')
            return JSON.parse(data)
        } catch (error) {
            if (error.code === 'ENOENT') {
                return []
            }
            throw error
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProducts()
            return products.find(product => product.id === id)
        } catch (error) {
            console.error('No se encontro el ID de producto', error)
        }
    }

    async updateProduct(id, newData) {
        try {
            const products = await this.getProducts()
            const index = products.findIndex(product => product.id === id)
            if (index !== -1) {
                products[index] = { ...products[index], ...newData }
                await fs.writeFile(this.path, JSON.stringify(products, null, 2))
            } else {
                throw new Error('El producto no fue encontrado')
            }
        } catch (error) {
            console.error('Ocurrio un error actualizndo el archivo', error)
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getProducts()
            const filteredProducts = products.filter(product => product.id !== id)
            if (filteredProducts.length !== products.length) {
                await fs.writeFile(this.path, JSON.stringify(filteredProducts, null, 2))
            } else {
                throw new Error('Este producto no fue encontrado')
            }
        } catch (error) {
            console.error('Ocurrio un error eliminando el producto', error)
        }
    }
}

// Arregle los errores que se me indico en el desafio pasado.

const productManager = new ProductManager('products.json')

/*const productos = [
    {
        "title": "Camiseta MYTH",
        "description": "Camiseta de algodón con el logo del album MYTH.",
        "price": 29.99,
        "thumbnail": "camiseta_myth.jpg",
        "code": "CAM001",
        "stock": 35
    },
    {
        "title": "Taza Myth",
        "description": "Taza de ceramica con el logo del album MYTH.",
        "price": 21.99,
        "thumbnail": "taza_myth.jpg",
        "code": "TAZ001",
        "stock": 50
    },
    {
        "title": "Póster MYTH 18 x 24",
        "description": "Póster de alta calidad del album MYTH.",
        "price": 24.99,
        "thumbnail": "poster_myth.jpg",
        "code": "POS001",
        "stock": 100
    },
    {
        "title": "Póster Canvas Limitada MYTH",
        "description": "Póster de edicion limitada impresa en lienzo.",
        "price": 74.99,
        "thumbnail": "poster_canvas_myth.jpg",
        "code": "CAN001",
        "stock": 20
    },
    {
        "title": "Camiseta Archangel",
        "description": "Camiseta de algodón con el logo del album Archangel.",
        "price": 29.99,
        "thumbnail": "camiseta_archangel.jpg",
        "code": "CAM002",
        "stock": 15
    },
    {
        "title": "Taza Archangel",
        "description": "Taza de ceramica con el logo del album Archangel.",
        "price": 21.99,
        "thumbnail": "taza_archangel.jpg",
        "code": "TAZ002",
        "stock": 50
    },
    {
        "title": "Póster Archangel 18 x 24",
        "description": "Póster de alta calidad del album Archangel.",
        "price": 24.99,
        "thumbnail": "poster_myth.jpg",
        "code": "POS002",
        "stock": 70
    },
    {
        "title": "Camiseta SkyWorld",
        "description": "Camiseta de algodón con el logo del album SkyWorld.",
        "price": 29.99,
        "thumbnail": "camiseta_skyworld.jpg",
        "code": "CAM003",
        "stock": 55
    },
    {
        "title": "Taza SkyWorld",
        "description": "Taza de ceramica con el logo del album SkyWorld.",
        "price": 21.99,
        "thumbnail": "taza_skyworld.jpg",
        "code": "TAZ003",
        "stock": 50
    },
    {
        "title": "Póster SkyWorld 18 x 24",
        "description": "Póster de alta calidad del album SkyWorld.",
        "price": 24.99,
        "thumbnail": "poster_skyworld.jpg",
        "code": "POS003",
        "stock": 70
    },
    {
        "title": "Camiseta Miracles",
        "description": "Camiseta de algodón con el logo del album Miracles.",
        "price": 29.99,
        "thumbnail": "camiseta_miracles.jpg",
        "code": "CAM004",
        "stock": 55
    },
    {
        "title": "Taza Miracles",
        "description": "Taza de ceramica con el logo del album Miracles.",
        "price": 21.99,
        "thumbnail": "taza_miracles.jpg",
        "code": "TAZ004",
        "stock": 50
    },
    {
        "title": "Póster Miracles 18 x 24",
        "description": "Póster de alta calidad del album Miracles.",
        "price": 24.99,
        "thumbnail": "poster_miracles.jpg",
        "code": "POS004",
        "stock": 70
    },
    {
        "title": "Póster Canvas Limitada Miracles",
        "description": "Póster de edicion limitada impresa en lienzo.",
        "price": 74.99,
        "thumbnail": "poster_canvas_miracles.jpg",
        "code": "CAN002",
        "stock": 20
    }
]

//Queria usar un json pero se me complico un poco

productos.forEach(productData => {
    const newProduct = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        thumbnail: productData.thumbnail,
        code: productData.code,
        stock: productData.stock
    }
    productManager.addProduct(newProduct)
})*/

module.exports = ProductManager