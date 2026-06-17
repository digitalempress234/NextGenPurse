import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { config } from "./config/env.js";
import logger from "./middleware/logger.middleware.js";
import { initializeChatSocket } from "./services/chatSocket.service.js";

const PORT = config.port;

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, async () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);

      try {
        await initializeChatSocket(server);
        logger.info("Socket.IO chat initialized");
      } catch (socketError) {
        logger.error("Socket.IO initialization failed:", {
          message: socketError.message,
          stack: socketError.stack,
        });

        logger.warn(
          "Server will continue running without Socket.IO Redis chat",
        );
      }
    });

    server.on("error", (error) => {
      logger.error("HTTP server error:", {
        message: error.message,
        stack: error.stack,
      });

      gracefulShutdown("serverError");
    });

    registerProcessHandlers();
  } catch (err) {
    logger.error("Failed to start server:", {
      message: err.message,
      stack: err.stack,
    });

    await safeDisconnectDB();
    process.exit(1);
  }
};

const registerProcessHandlers = () => {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection:", {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise,
    });

    gracefulShutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", {
      message: error.message,
      stack: error.stack,
    });

    gracefulShutdown("uncaughtException");
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received");
    gracefulShutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT signal received");
    gracefulShutdown("SIGINT");
  });
};

const safeDisconnectDB = async () => {
  try {
    await disconnectDB();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Failed to close database connection:", {
      message: error.message,
      stack: error.stack,
    });
  }
};

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info(`Starting graceful shutdown. Signal: ${signal}`);

  const forceShutdownTimer = setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 30000);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) return reject(error);
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    await safeDisconnectDB();

    clearTimeout(forceShutdownTimer);

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimer);

    logger.error("Error during graceful shutdown:", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();

export default server;
