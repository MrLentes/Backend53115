const fs = require('fs');

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

const ProductManager = {
    path: '',

    initialize(path) {
        this.path = path
    },

    getProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf8')
            return JSON.parse(data)
        } catch (err) {
            console.error('Error al cargar productos desde el archivo:', err)
            return []
        }
    },

    addProduct(newProduct) {
        const products = this.getProducts()
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
        newProduct.id = newId
        products.push(newProduct)
        fs.writeFileSync(this.path, JSON.stringify(products, null, 2))
    },

    getProductById(id) {
        const products = this.getProducts()
        return products.find(product => product.id === id)
    },

    updateProduct(id, newData) {
        const products = this.getProducts()
        const index = products.findIndex(product => product.id === id)
        if (index !== -1) {
            products[index] = { ...products[index], ...newData }
            fs.writeFileSync(this.path, JSON.stringify(products, null, 2))
            return true
        }
        return false
    },

    deleteProduct(id) {
        const products = this.getProducts()
        const index = products.findIndex(product => product.id === id)
        if (index !== -1) {
            products.splice(index, 1)
            fs.writeFileSync(this.path, JSON.stringify(products, null, 2))
            return true
        }
        return false
    }
}