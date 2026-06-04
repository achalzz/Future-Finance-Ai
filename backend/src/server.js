import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import financeRouter from "./routes/finance.routes.js";

// Load configurations
import config from "./config/env.js";

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

// Global flag to track if MongoDB is active
global.dbConnected = false;

const MONGO_URI = config.MONGO_URI;

console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("💾 MongoDB Connected Successfully");
    global.dbConnected = true;
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("⚠️ Running in hybrid mode: Database operations will fall back to local memory.");
  });

// Register modular finance routes under '/api' prefix
app.use("/api", financeRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
