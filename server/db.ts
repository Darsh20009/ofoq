import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️  MONGODB_URI not set — running without database (limited functionality)");
    return;
  }

  if (isConnected) return;

  try {
    mongoose.set("strictQuery", false);
    // Never allow an unavailable production database to hold requests for
    // Mongoose's default 10-second buffer timeout.
    mongoose.set("bufferCommands", false);
    mongoose.set("bufferTimeoutMS", 2000);

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    isConnected = false;
    // Don't exit — allow app to run with degraded mode
  }
}

export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export { mongoose };
