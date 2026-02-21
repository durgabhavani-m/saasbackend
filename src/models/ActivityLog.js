import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    action: { type: String, enum: ['SALE', 'ADJUSTMENT'], required: true },
    quantity: { type: Number, required: true },
    remainingStock: { type: Number, required: true },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);


