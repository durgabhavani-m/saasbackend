import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it in Render Dashboard → Environment");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ Connected to MongoDB (db: ${mongoose.connection.name})`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (err.name === "MongooseServerSelectionError") {
      console.error("   → Add 0.0.0.0/0 to Atlas: Network Access → Add IP → Allow from Anywhere");
    }
    throw err;
  }
}
