const mongoose = require('mongoose');
require('dotenv').config();
const PrintLocation = require('./models/PrintLocation');

const defaultLocations = [
  { name: 'Left Chest Logo', cost: 20 },
  { name: '15 × 7 cm Chest Design', cost: 35 },
  { name: 'A4 Print', cost: 50 },
  { name: 'A3 Print', cost: 80 },
  { name: 'Sleeve Print', cost: 30 },
  { name: 'Front + Back Print', cost: 120 }
];

async function seed() {
  try {
    // Assuming you have MONGO_URI in your .env
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vybe';
    await mongoose.connect(uri);
    
    // Check if any exist
    const count = await PrintLocation.countDocuments();
    if (count === 0) {
      await PrintLocation.insertMany(defaultLocations);
      console.log('Successfully seeded default print locations!');
    } else {
      console.log(`Already have ${count} print locations in DB. No seeding needed.`);
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
