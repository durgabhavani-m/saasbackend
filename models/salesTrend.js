
import mongoose from "mongoose";

const salesTrendSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    monthName: { type: String }, // e.g., "Jan", "Feb", etc.
    revenue: { type: Number, required: true },
    orders: { type: Number, required: true },
    orderCount: { type: Number, required: true },
  },
  {
    timestamps: true, // optional
  }
);

const SalesTrend = mongoose.model("SalesTrend", salesTrendSchema);

export default SalesTrend;
