require('dotenv').config()
const { connect, mongoose } = require('../db')

async function listCollections() {
  try {
    await connect()
    const names = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections in DB:')
    names.forEach(n => console.log('-', n.name))
    process.exit(0)
  } catch (err) {
    console.error('Error listing collections:', err)
    process.exit(1)
  }
}

listCollections()
