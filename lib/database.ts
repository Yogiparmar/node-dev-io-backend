import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI in .env.local");
}

// Caching the connection for better performance in Next.js (avoiding re-connections)
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Use global cache in development to prevent multiple connections
const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "tms-systems",
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("🔥 MongoDB Connected!");
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Store the cache in global scope to persist across hot reloads in development
if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}

export default connectDB;
