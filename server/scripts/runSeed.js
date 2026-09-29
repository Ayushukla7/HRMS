const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });
const connectDB = require('../config/db');
const seedData = require('../config/seed');

const run = async () => {
  try {
    await connectDB();
    await seedData(true);
    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

run();
