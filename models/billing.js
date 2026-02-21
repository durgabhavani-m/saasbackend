import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customerName: {
      type: String,
      trim: true
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active'
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

const Billing = mongoose.model('Billing', billingSchema);
export default Billing;
