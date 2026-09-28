const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      console.log(`Connecting to configured MongoDB URI...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ Failed connecting to MONGODB_URI: ${err.message}`);
    }
  }

  // Fallback to local MongoDB
  try {
    const localUri = 'mongodb://127.0.0.1:27017/hrms_db';
    console.log(`Attempting connection to local MongoDB at: ${localUri}`);
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Local MongoDB Connected`);
    return;
  } catch (localErr) {
    console.warn(`Local MongoDB not running (${localErr.message}). Starting In-Memory Mongo instance...`);
  }

  // Fallback to in-memory mongodb
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    
    await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Connected at: ${memoryUri}`);
  } catch (memErr) {
    console.warn(`⚠️ In-Memory MongoDB could not start (${memErr.message}).`);
    console.warn(`💡 TIP FOR RENDER/PRODUCTION: Provide MONGODB_URI in Render Environment variables from MongoDB Atlas (free tier).`);
  }
};

module.exports = connectDB;
