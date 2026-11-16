const mongoose = require("mongoose");
const dns = require("dns");

let memoryServer;

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env file.");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected");
    return;
  } catch (error) {
    console.warn("Primary MongoDB connection failed, attempting in-memory fallback.");
    console.warn(error.message);

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const fallbackUri = memoryServer.getUri();
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log("MongoDB connected via in-memory fallback");
    } catch (fallbackError) {
      console.error("MongoDB fallback failed.");
      console.error(fallbackError.message);
      throw fallbackError;
    }
  }
}

module.exports = connectDB;