
import mongoose from "mongoose";

const topProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
    category: { type: String, required: true },
    rank: { type: Number, required: true },
  },
  {
    timestamps: true, // optional: adds createdAt & updatedAt
  }
);

const TopProduct = mongoose.model("TopProduct", topProductSchema);

export default TopProduct;
