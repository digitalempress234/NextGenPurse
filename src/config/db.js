import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  const isTest = process.env.NODE_ENV === "test";
  const uri = isTest ? config.mongoUriTest : config.mongoUri;

  if (!uri) {
    throw new Error("Missing MongoDB connection string");
  }

  // MongoDB connection options for production
  const connectionOptions = {
    // Connection pool settings
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 5, // Minimum number of connections in the pool

    // Timeouts
    serverSelectionTimeoutMS: 5000, // How long to try connecting before failing
    socketTimeoutMS: 45000, // How long to wait for a response before timing out

    // Retry settings
    retryReads: true, // Retry read operations on error
    retryWrites: true, // Retry write operations on error

    // Heartbeat settings
    heartbeatFrequencyMS: 10000, // How often to check server connectivity

    // Direct connection (disable for replica sets)
    directConnection: false,

    // SSL/TLS settings for production
    ...(config.nodeEnv === "production" && uri.startsWith("mongodb+srv")
      ? {
          tls: true,
          tlsAllowInvalidCertificates: false,
        }
      : {}),
  };

  try {
    await mongoose.connect(uri, connectionOptions);
    console.log(`MongoDB Connected to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);

    // Log connection info
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Handle connection events
    mongoose.connection.on("reconnected", () => {
      console.log("Mongoose reconnected to MongoDB");
    });

    // Graceful shutdown for the connection
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};