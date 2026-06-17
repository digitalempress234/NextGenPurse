import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { config } from "./config/env.js";
import logger from "./middleware/logger.middleware.js";
import { initializeChatSocket } from "./services/chatSocket.service.js";
const PORT = config.port;
let server;
const formatError = (err) => {
    if (!err)
        return "Unknown error";
    if (err instanceof Error)
        return err.stack || err.message;
    try {
        return JSON.stringify(err);
    }
    catch {
        return String(err);
    }
};
const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
            logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
            logger.info(`Health Check: http://localhost:${PORT}/health`);
        });
        try {
            await initializeChatSocket(server);
            logger.info("Socket.IO chat initialized");
        }
        catch (err) {
            logger.error(`Chat socket initialization failed: ${formatError(err)}`);
            if (config.nodeEnv === "production") {
                throw err;
            }
            logger.warn("Continuing without Socket.IO chat in development.");
        }
    }
    catch (err) {
        logger.error(`Failed to start server: ${formatError(err)}`);
        process.exit(1);
    }
};
// Graceful shutdown function
async function gracefulShutdown(signal) {
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
                await disconnectDB();
                logger.info("Database connection closed");
                // Close any other connections (Redis, etc.)
                logger.info("Graceful shutdown completed");
                process.exit(0);
            }
        }
        catch (error) {
            logger.error("Error during graceful shutdown:", error);
            process.exit(1);
        }
    };
    // If server is not defined, just exit
    if (!server) {
        process.exit(0);
    }
    await shutdown();
}
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled Rejection: ${formatError(reason)}`);
    gracefulShutdown("unhandledRejection");
});
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${formatError(error)}`);
    gracefulShutdown("uncaughtException");
});
// Handle SIGTERM signal
process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    gracefulShutdown("SIGTERM");
});
// Handle SIGINT signal
process.on("SIGINT", () => {
    logger.info("SIGINT signal received: closing HTTP server");
    gracefulShutdown("SIGINT");
});
// Start the server
startServer();
export default server;
//# sourceMappingURL=server.js.map