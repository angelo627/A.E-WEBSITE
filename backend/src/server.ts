import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma-client";

async function startServer(): Promise<void> {
  await prisma.$connect();
  console.log("Connected to PostgreSQL through Prisma.");


  const server = app.listen(env.port, () => {
    const baseUrl = env.appBaseUrl.replace(/\/$/, "");
    console.log(`Server is running on port ${env.port}.`);
    console.log(`API Base URL: ${baseUrl}`);
    console.log(`Swagger UI: ${baseUrl}/api/docs`);
    console.log(`OpenAPI JSON: ${baseUrl}/api/docs.json`);
  });

  // Handle server startup errors
  server.on("error", async (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${env.port} is already in use. Update PORT in .env and retry.`);
    } else {
      console.error("Server failed to start:", error);
    }

    await prisma.$disconnect();
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Closing server gracefully.`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // In production, you might want to gracefully shut down or report to an error tracking service
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // For uncaught exceptions, it's safer to shut down the process after logging
    void shutdown("UNCUGHT_EXCEPTION");
  });
}

// Start the server and handle any startup errors

startServer().catch(async (error) => {
  console.error("Failed to start server:", error);
  await prisma.$disconnect();
  process.exit(1);
});
