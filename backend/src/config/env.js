import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];
const missingRequired = required.filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
  console.error("❌ CRITICAL: Missing required environment variables:");
  missingRequired.forEach((key) => console.error(`   - ${key}`));
  console.warn("⚠️ Using default fallback configuration values for local development.");
}

export const config = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/future-finance",
  JWT_SECRET: process.env.JWT_SECRET || "futurefinance_jwt_secret_key_2026",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || null,
  PORT: process.env.PORT || 5000,
};

// Check LLM state
const hasLLM = config.GEMINI_API_KEY || config.OPENAI_API_KEY || config.N8N_WEBHOOK_URL;
if (!hasLLM) {
  console.warn(
    "⚠️ WARNING: No AI model config found (GEMINI_API_KEY, OPENAI_API_KEY, or N8N_WEBHOOK_URL is missing).\n" +
      "   Chat advisor will run using the local rules engine fallback."
  );
} else {
  console.log("📡 AI Engine configured successfully using: " +
    [
      config.GEMINI_API_KEY ? "Gemini API" : null,
      config.OPENAI_API_KEY ? "OpenAI API" : null,
      config.N8N_WEBHOOK_URL ? "n8n Webhook" : null,
    ].filter(Boolean).join(", ")
  );
}

export default config;
