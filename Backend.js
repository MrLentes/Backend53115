const Product = {
    create (Id, Title, Description, Price, Thumbnail, Code, Stock) {
        return {
            id: Id,
            title: Title,
            description: Description,
            price: Price,
            thumbnail: Thumbnail,
            code: Code,
            stock: Stock
        };
    }
};

class ProductManager {
    constructor () {
        this.products = []
        this.nextId = 1
    }

    addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error("No se puede crear el producto porque faltan datos del mismo")
            return
        }

        if (this.products.some(product => product.code === code)) {
            console.error("Ya existe un producto con ese codigo. Intenta un codigo diferente")
            return
        }

        const product = Product.create(this.nextId++, title, description, price, thumbnail, code, stock)
        this.products.push(product)
    }

    getProducts() {
        return this.products
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id)
        if (!product) {
            console.error("Not Found")
        }
        return product
    }
}
