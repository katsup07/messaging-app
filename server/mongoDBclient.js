const { MongoClient, ServerApiVersion } = require('mongodb');
const { logInfo, logError } = require('./src/middleware/logger');

const uri = process.env.MONGODB_URI;
if (!uri) 
  throw new Error("MONGODB_URI is not defined. Please set the environment variable.");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect() {
  try {
    await client.connect();
    logInfo("Connected to MongoDB");
  } catch (error) {
    logError("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = {
  connect,
  client
};