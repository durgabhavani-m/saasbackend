 require('dotenv').config()
const { connect } = require('../db')
const { seedSampleData } = require('../db/seedData')

async function runSeed() {
  try {
    await connect()
    await seedSampleData()
    console.log('Database seeding completed')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

runSeed()