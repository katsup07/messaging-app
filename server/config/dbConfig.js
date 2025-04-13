const { MongoClient, ServerApiVersion } = require('mongodb');
const { logInfo, logError } = require('../src/middleware/logger');

const uri = process.env.MONGODB_URI;
if (!uri) 
  throw new Error("MONGODB_URI is not defined. Please set the environment variable.");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection pool settings for better stability using correct option names
  maxPoolSize: 10,
  minPoolSize: 1,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
   // Add TLS settings to fix SSL error in production
   tls: true,
   tlsInsecure: false,
   // Network Timeout options to reduce vulnerability to slow attacks
  serverSelectionTimeoutMS: 5000,
  // Faster timeout on failed connections
  connectTimeoutMS: 10000
});

let isConnected = false;
async function connectToMongoDB() {
  if (isConnected) return;
  
  try {
    await client.connect();
    isConnected = true;
    logInfo("Connected to MongoDB");
  } catch (error) {
    isConnected = false;
    logError("MongoDB connection error:", error);
    throw error;
  }
}

///Check connection and reconnect if needed
async function getDb() {
  if (!isConnected) {
    try {
      await connectToMongoDB();
    } catch (error) {
      logError("Failed to reconnect to MongoDB:", error);
      throw error;
    }
  }
  return client;
}

module.exports = {
  connectToMongoDB,
  client,
  getDb
};