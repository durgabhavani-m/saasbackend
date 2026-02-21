import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    threshold: { type: Number, required: true, default: 5 },
    totalSold: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);


