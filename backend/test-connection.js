// Fix DNS resolution for MongoDB Atlas SRV on ISPs that block SRV records
// Must be called BEFORE mongoose.connect()
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Testing with Google DNS (8.8.8.8)...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
