
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 0 },
    category: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;


// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     category: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     stock: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     minStock: {
//       type: Number,
//       default: 5
//     },
//     description: {
//       type: String
//     },
//     status: {
//       type: String,
//       enum: ['active', 'inactive'],
//       default: 'active'
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Product', productSchema);
