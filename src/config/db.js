import mongoose from "mongoose";

export const connectDB = async () => {
  const isTest = process.env.NODE_ENV === "test";
  const uri = isTest ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MongoDB connection string");
  }
  await mongoose.connect(uri);
  console.log("MongoDB Connected");
};
