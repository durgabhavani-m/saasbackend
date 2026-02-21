const SalesTrend = require('../models/salesTrend')
const TopProduct = require('../models/topProduct')
const mongoose = require('mongoose')

async function seedSampleData() {
  try {
    // Sample sales trends for the last 30 days
    const sampleTrends = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      sampleTrends.push({
        date,
        totalRevenue: Math.floor(Math.random() * 10000) + 1000, // Random revenue between 1000-11000
        orderCount: Math.floor(Math.random() * 50) + 10 // Random orders between 10-60
      })
    }
    await SalesTrend.insertMany(sampleTrends)
    
    // Sample top products
    const sampleProducts = [
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Organic Soap",
         sku: "SOAP001",
        quantitySold: 150,
        revenue: 1500
      },
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Natural Shampoo",
         sku: "SHAM001",
        quantitySold: 120,
        revenue: 2400
      },
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Vitamin C Serum",
         sku: "VITC001",
        quantitySold: 80,
        revenue: 3200
      },
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Facial Cleanser",
         sku: "FACE001",
        quantitySold: 200,
        revenue: 4000
      },
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Hand Cream",
         sku: "HAND001",
        quantitySold: 100,
        revenue: 1000
      }
    ]
    await TopProduct.insertMany(sampleProducts)
    
    console.log('Sample data seeded successfully')
  } catch (error) {
    console.error('Error seeding sample data:', error)
  }
}

module.exports = { seedSampleData }