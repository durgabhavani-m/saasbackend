const mongoose = require('mongoose')
// Fix relative paths: this file is in backend/db, models are in backend/models
const SalesTrend = require('../models/salesTrend')
const TopProduct = require('../models/topProduct')

async function initializeCollections() {
  try {
    // Create salesTrends collection
    const salesTrendExists = await mongoose.connection.db.listCollections({ name: 'salestrends' }).hasNext()
    if (!salesTrendExists) {
      await mongoose.connection.db.createCollection('salestrends')
      console.log('Created salestrends collection')
    }

    // Create topProducts collection
    const topProductsExists = await mongoose.connection.db.listCollections({ name: 'topproducts' }).hasNext()
    if (!topProductsExists) {
      await mongoose.connection.db.createCollection('topproducts')
      console.log('Created topproducts collection')
    }
  } catch (error) {
    console.error('Error initializing collections:', error)
  }
}

module.exports = { initializeCollections }