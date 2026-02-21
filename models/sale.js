import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    revenue: { type: Number, required: true },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;



// const mongoose = require('mongoose');

// const saleItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   total: {
//     type: Number,
//     required: true,
//     min: 0
//   }
// });

// const saleSchema = new mongoose.Schema(
//   {
//     customerName: {
//       type: String,
//       trim: true
//     },
//     items: [saleItemSchema],
//     finalAmount: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     paymentMethod: {
//       type: String,
//       enum: ['cash', 'card', 'upi', 'other'],
//       default: 'cash'
//     },
//     status: {
//       type: String,
//       enum: ['completed', 'pending', 'cancelled'],
//       default: 'completed'
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Sale', saleSchema);
