import mongoose from "mongoose";

let isConnected = false;
let isConnecting = false;
let reconnectTimer: NodeJS.Timeout | null = null;
let connectionUri = "";

// Configure this before any model is imported so no query can enter
// Mongoose's default operation buffer while the database is unavailable.
mongoose.set("strictQuery", false);
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 2000);

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
  isConnected = false;
  if (connectionUri) scheduleReconnect(connectionUri);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

function scheduleReconnect(uri: string): void {
  if (reconnectTimer || isConnected) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectDB(uri);
  }, 10_000);
}

export async function connectDB(uri = process.env.MONGODB_URI): Promise<void> {

  if (!uri) {
    console.warn("⚠️  MONGODB_URI not set — running without database (limited functionality)");
    return;
  }

  connectionUri = uri;
  if (isConnected || isConnecting) return;

  isConnecting = true;
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");

  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    isConnected = false;
    scheduleReconnect(uri);
    // Keep the server available for health checks and static assets while
    // retrying in the background. Database routes return a clear 503.
  } finally {
    isConnecting = false;
  }
}

export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export { mongoose };
