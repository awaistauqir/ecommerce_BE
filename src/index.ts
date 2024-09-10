import prisma from "../prisma/prisma";
import app from "./app";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");

    // Your express app configurations and routes go here

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to connect to the database:",
      (error as Error).message
    );
    process.exit(1); // Exit the process with failure
  }
}

startServer();
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from the database");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from the database");
  process.exit(0);
});
