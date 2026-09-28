const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms_db';
    
    // Attempt connection with low timeout to detect if local mongo is up
    console.log(`Attempting connection to MongoDB at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`Local MongoDB not detected (${err.message}). Starting embedded In-Memory MongoDB for seamless operation...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      
      await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected at: ${uri}`);
    } catch (memErr) {
      console.error('Critical Database connection error:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
