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
            await fs.writeFile(this.path, JSON.stringify(products, null, 2))
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