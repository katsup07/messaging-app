const { MongoClient, ServerApiVersion } = require('mongodb');
const { logInfo, logError } = require('./src/middleware/logger');

const uri = process.env.MONGODB_URI;
if (!uri) 
  throw new Error("MONGODB_URI is not defined. Please set the environment variable.");

// Connection caching
let cachedClient = null;
let cachedDb = null;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // These options help with Vercel's serverless environment
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  maxIdleTimeMS: 120000
});

async function connect() {
  if (cachedClient) {
    logInfo("Using cached MongoDB connection");
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Connect the client to the server
    await clientPromise.connect();
    
    // Store the connected client and database instance
    cachedClient = clientPromise;
    cachedDb = clientPromise.db();
    
    logInfo("Connected to MongoDB");
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    logError("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = {
  connect,
  client
};