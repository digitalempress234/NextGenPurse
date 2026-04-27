import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import logger from "./middleware/logger.middleware.js";

const PORT = config.port;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Graceful shutdown on unhandled rejection
      gracefulShutdown("unhandledRejection");
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    // Handle SIGTERM signal
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      gracefulShutdown("SIGTERM");
    });

    // Handle SIGINT signal (Ctrl+C)
    process.on("SIGINT", () => {
      logger.info("SIGINT signal received: closing HTTP server");
      gracefulShutdown("SIGINT");
    });

  } catch (err) {
    logger.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  const timeout = 30000; // 30 seconds timeout

  const shutdown = async () => {
    try {
      logger.info(`Starting graceful shutdown (signal: ${signal})`);

      // Close the HTTP server
      if (server) {
        server.close(() => {
          logger.info("HTTP server closed");
        });

        // Force close after timeout
        setTimeout(() => {
          logger.error("Could not close connections in time, forcefully shutting down");
          process.exit(1);
        }, timeout);

        // Close database connection
        const mongoose = await import("mongoose");
        await mongoose.default.connection.close();
        logger.info("Database connection closed");

        // Close any other connections (Redis, etc.)
        // Add your cleanup code here

        logger.info("Graceful shutdown completed");
        process.exit(0);
      }
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  // If server is not defined, just exit
  if (!server) {
    process.exit(0);
  }

  await shutdown();
};

// Start the server
startServer();

export default server;