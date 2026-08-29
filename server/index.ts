import "dotenv/config";
import http from "http";
import { app } from "./app.js";
import { connectDB } from "./db.js";
import { initWebSocket } from "./ws.js";
import { generateVapidKeys } from "./push.js";
import { startScheduler } from "./scheduler.js";
import { ensureDefaultPartners } from "./services/partner-seed.service.js";
import { verifyEmailTransport } from "./email.js";

const PORT = parseInt(process.env.PORT || "5000");

async function bootstrap() {
  // Connect to MongoDB
  await connectDB();
  await ensureDefaultPartners().catch((error) => {
    console.error("❌ Partner initialization failed:", error?.message || error);
  });

  // Generate VAPID keys if not set
  await generateVapidKeys();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket
  initWebSocket(server);

  // Start background scheduler (AI analytics, cleanup, etc.)
  startScheduler();

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 OFOQ Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 WebSocket: ready`);
    void verifyEmailTransport();
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("⚠️  SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
