import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, required: true },
    invoiceNumber: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Sale', SaleSchema);


