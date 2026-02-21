import SalesTrend from "../models/salesTrend.js";
import TopProduct from "../models/topProduct.js";
import Sale from "../models/sale.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function seedSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await SalesTrend.deleteMany({});
    await TopProduct.deleteMany({});
    await Sale.deleteMany({});
    console.log("✅ Cleared existing data");

    // Generate sales trend data for the past 6 months (matching the image)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const revenueData = [44000, 52000, 48000, 61000, 55000, 68000];
    const ordersData = [120, 130, 125, 145, 138, 155];

    const sampleTrends = [];
    // Use the current month as the 6th month (June)
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      date.setDate(1); // First day of the month
      
      sampleTrends.push({
        date,
        monthName: months[i], // Store the month name explicitly
        revenue: revenueData[i],
        orders: ordersData[i],
        orderCount: Math.floor(ordersData[i] / 3), // Approximate order count
      });
    }
    await SalesTrend.insertMany(sampleTrends);
    console.log("✅ Seeded sales trends data");

    // Sample top products (matching the image)
    const sampleProducts = [
      {
        sku: "AVS-001",
        name: "Aloe Vera Soap",
        totalQuantity: 450,
        totalRevenue: 42750, // 450 * 95
        category: "Soap",
        rank: 1,
      },
      {
        sku: "HS-500",
        name: "Herbal Shampoo",
        totalQuantity: 320,
        totalRevenue: 79680, // 320 * 249
        category: "Hair Care",
        rank: 2,
      },
      {
        sku: "CT-SET",
        name: "Cotton Towels",
        totalQuantity: 280,
        totalRevenue: 167720, // 280 * 599
        category: "Home & Living",
        rank: 3,
      },
      {
        sku: "VCT-100",
        name: "Vitamin C",
        totalQuantity: 150,
        totalRevenue: 59850, // 150 * 399
        category: "Supplements",
        rank: 4,
      },
    ];
    await TopProduct.insertMany(sampleProducts);
    console.log("✅ Seeded top products data");

    // Also generate individual sales records for analytics
    const saleRecords = [];
    const skus = ["AVS-001", "HS-500", "CT-SET", "VCT-100"];
    const prices = [95, 249, 599, 399];
    
    // Generate sales for each month
    for (let month = 5; month >= 0; month--) {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() - month);
      baseDate.setDate(1);
      
      // Generate 15-25 sales per month
      const salesPerMonth = Math.floor(Math.random() * 11) + 15;
      
      for (let i = 0; i < salesPerMonth; i++) {
        const skuIndex = Math.floor(Math.random() * skus.length);
        const quantity = Math.floor(Math.random() * 5) + 1;
        const revenue = quantity * prices[skuIndex];
        
        const saleDate = new Date(baseDate);
        saleDate.setDate(saleDate.getDate() + Math.floor(Math.random() * 28));
        
        saleRecords.push({
          date: saleDate,
          sku: skus[skuIndex],
          quantity: quantity,
          revenue: revenue,
        });
      }
    }
    await Sale.insertMany(saleRecords);
    console.log("✅ Seeded sales records");

    console.log("\n🎉 Sample data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
    process.exit(1);
  }
}

seedSampleData();

