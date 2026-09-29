import config from "./app/config/index.js";
import app from "./app.js";
import { connectToDatabase } from "./app/db/db.js";
import { Server } from "http";
import { gracefulShutdown } from "./app/utils/gracefullShutdownServer/shutDownServer.js";
import seedSuperAdmin from "./app/db/createSuperAdmin.js";

// Declare a variable to hold the server instance
let myServer: Server | undefined;

// Connect to MongoDB
async function initializeDatabase() {
  try {
    await connectToDatabase();
    console.log("Connected to MongoDB");
    await seedSuperAdmin();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
// Start the server
async function startServer() {
  try {
    myServer = app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

// Main function to connect to database and start the server
async function main() {
  try {
    await initializeDatabase();
    await startServer();
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1); // Exit the process with a failure code
  }
}

// Run the main function
main();

// Handle Critical Errors- Unhandled Promise Rejections and Uncaught Exceptions
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  gracefulShutdown(myServer, "unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown(myServer, "uncaughtException", 1);
});
//System Signals
process.on("SIGINT", () => gracefulShutdown(myServer, "SIGINT", 0)); // Ctrl + C
process.on("SIGTERM", () => gracefulShutdown(myServer, "SIGTERM", 0)); // Docker / PM2
