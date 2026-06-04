import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/env.js";
import {
  fetchDashboardData,
  generateChatResponse,
  fetchExpenses,
  createExpense,
  removeExpense,
  fetchGoals,
  createGoal,
  updateGoalProgress,
  removeGoal,
  fetchFinancialHealth,
  fetchBudgetAnalysis,
  fetchBudget,
  updateBudget,
} from "../services/finance.service.js";

// In-memory fallback user database
const memoryUsers = [];

// Helper to generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Health check endpoint handler
export const getHealth = (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Future Finance API running"
  });
};

// User registration controller
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    if (global.dbConnected) {
      // MongoDB Flow
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      const token = generateToken(savedUser._id, savedUser.email);

      return res.status(251).json({
        token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
        }
      });
    } else {
      // Memory Fallback Flow
      const existingUser = memoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        password: hashedPassword,
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.email);

      return res.status(251).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// User login controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    if (global.dbConnected) {
      // MongoDB Flow
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "User does not exist with this email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid login credentials" });
      }

      const token = generateToken(user._id, user.email);
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } else {
      // Memory Fallback Flow
      const user = memoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ error: "User does not exist with this email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid login credentials" });
      }

      const token = generateToken(user._id, user.email);
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Dashboard stats endpoint handler
export const getDashboard = async (req, res) => {
  try {
    const data = await fetchDashboardData(req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Chat advisor endpoint handler
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }
    const replyData = await generateChatResponse(req.user.id, message);
    return res.status(200).json({
      success: true,
      reply: replyData.reply,
      response: replyData.reply, // Compatibility key
      suggestedActions: replyData.suggestedActions,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all expenses controller
export const getExpenses = async (req, res) => {
  try {
    const expenses = await fetchExpenses(req.user.id);
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Add new expense controller
export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const expense = await createExpense(req.user.id, { title, amount, category, date });
    return res.status(251).json(expense);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete expense controller
export const deleteExpense = async (req, res) => {
  try {
    await removeExpense(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GOALS CONTROLLERS
export const getGoals = async (req, res) => {
  try {
    const goals = await fetchGoals(req.user.id);
    return res.status(200).json(goals);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Add new goal controller
export const addGoal = async (req, res) => {
  try {
    const { title, targetAmount, category, monthlyContribution, targetDate } = req.body;
    if (!title || !targetAmount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const goal = await createGoal(req.user.id, {
      title,
      targetAmount: parseFloat(targetAmount),
      category,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      targetDate: targetDate || null
    });
    return res.status(251).json(goal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Contribute to goal controller
export const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Contribution amount must be greater than 0" });
    }
    const goal = await updateGoalProgress(req.user.id, req.params.id, amount);
    return res.status(200).json(goal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete goal controller
export const deleteGoal = async (req, res) => {
  try {
    await removeGoal(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Financial health endpoint controller
export const getFinancialHealth = async (req, res) => {
  try {
    const healthReport = await fetchFinancialHealth(req.user.id);
    return res.status(200).json(healthReport);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Budget analysis endpoint controller (50/30/20)
export const getBudgetAnalysis = async (req, res) => {
  try {
    const analysis = await fetchBudgetAnalysis(req.user.id);
    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch user budget settings
export const getBudget = async (req, res) => {
  try {
    const budget = await fetchBudget(req.user.id);
    return res.status(200).json(budget);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update/Save user budget settings
export const saveBudget = async (req, res) => {
  try {
    const { income, savingsGoal, monthlyLimit } = req.body;
    if (income === undefined || savingsGoal === undefined) {
      return res.status(400).json({ error: "Missing required fields (income, savingsGoal)" });
    }
    const budget = await updateBudget(req.user.id, { income, savingsGoal, monthlyLimit });
    return res.status(200).json(budget);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
