import express from "express";
import {
  getHealth,
  getDashboard,
  handleChat,
  getExpenses,
  addExpense,
  deleteExpense,
  registerUser,
  loginUser,
  getGoals,
  addGoal,
  contributeToGoal,
  deleteGoal,
  getFinancialHealth,
  getBudgetAnalysis,
  getBudget,
  saveBudget,
} from "../controllers/finance.controller.js";
import { downloadMonthlyReport } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/health", getHealth);
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

// Protected routes (require valid JWT auth token)
router.get("/dashboard", authMiddleware, getDashboard);
router.post("/chat", authMiddleware, handleChat);
router.post("/financial-advice", authMiddleware, handleChat);

// Expense routes
router.get("/expenses", authMiddleware, getExpenses);
router.post("/expenses", authMiddleware, addExpense);
router.delete("/expenses/:id", authMiddleware, deleteExpense);

// Goals routes
router.get("/goals", authMiddleware, getGoals);
router.post("/goals", authMiddleware, addGoal);
router.put("/goals/:id", authMiddleware, contributeToGoal);
router.delete("/goals/:id", authMiddleware, deleteGoal);

// Financial health report route
router.get("/financial-health", authMiddleware, getFinancialHealth);

// Budget analysis route (50/30/20)
router.get("/budget-analysis", authMiddleware, getBudgetAnalysis);

// Budget settings routes
router.get("/budget", authMiddleware, getBudget);
router.post("/budget", authMiddleware, saveBudget);

// PDF Monthly Report
router.get("/reports/monthly", authMiddleware, downloadMonthlyReport);

export default router;
