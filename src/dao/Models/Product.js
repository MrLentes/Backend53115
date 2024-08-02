const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String },
  thumbnails: { type: [String], default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
})

productSchema.pre('save', function(next) {
  if (!this.owner) {
    this.owner = 'Admin'
  }
  next()
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product