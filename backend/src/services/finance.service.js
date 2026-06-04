import axios from "axios";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Goal from "../models/Goal.js";
import ChatHistory from "../models/ChatHistory.js";
import User from "../models/User.js";
import Budget from "../models/Budget.js";
import config from "../config/env.js";

// Local in-memory fallback databases mapped by userId (clean slate — no demo data)
let memoryExpenses = [];
let memoryGoals = [];
let memoryChatHistory = [];
let memoryBudgets = [];

const DEFAULT_MONTHLY_INCOME = 30000;

const getGradeFromScore = (score) => {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
};

const getRatingFromScore = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Review";
  return "Critical";
};

const isDbConnected = (userId) => {
  return global.dbConnected && mongoose.Types.ObjectId.isValid(userId);
};

const getBudgetSnapshot = async (userId, expenses, goals) => {
  let income = DEFAULT_MONTHLY_INCOME;
  let savingsGoal = Math.round(DEFAULT_MONTHLY_INCOME * 0.2);
  let monthlyLimit = Math.round(DEFAULT_MONTHLY_INCOME * 0.7);

  if (isDbConnected(userId)) {
    try {
      const budget = await Budget.findOne({ user: userId });
      if (budget) {
        income = budget.income || income;
        savingsGoal = budget.savingsGoal || savingsGoal;
        monthlyLimit = budget.monthlyLimit || monthlyLimit;
      }
    } catch (err) {
      console.warn("Failed to load budget snapshot, using defaults:", err.message);
    }
  } else {
    const budget = memoryBudgets.find(b => b.user === userId);
    if (budget) {
      income = budget.income || income;
      savingsGoal = budget.savingsGoal || savingsGoal;
      monthlyLimit = budget.monthlyLimit || monthlyLimit;
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalGoalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const monthlySavings = Math.max(0, income - totalExpenses);

  return {
    income,
    expenses: totalExpenses,
    savings: totalGoalSavings || monthlySavings,
    monthlySavings,
    savingsGoal,
    monthlyLimit
  };
};

export const fetchBudget = async (userId) => {
  let income = DEFAULT_MONTHLY_INCOME;
  let savingsGoal = Math.round(DEFAULT_MONTHLY_INCOME * 0.2);
  let monthlyLimit = Math.round(DEFAULT_MONTHLY_INCOME * 0.7);

  if (isDbConnected(userId)) {
    try {
      const budget = await Budget.findOne({ user: userId });
      if (budget) {
        return {
          id: budget._id.toString(),
          income: budget.income,
          savingsGoal: budget.savingsGoal,
          monthlyLimit: budget.monthlyLimit,
        };
      }
    } catch (err) {
      console.error("Failed to fetch budget:", err.message);
    }
  } else {
    const budget = memoryBudgets.find(b => b.user === userId);
    if (budget) {
      return {
        id: budget._id,
        income: budget.income,
        savingsGoal: budget.savingsGoal,
        monthlyLimit: budget.monthlyLimit,
      };
    }
  }

  return { income, savingsGoal, monthlyLimit };
};

export const updateBudget = async (userId, budgetData) => {
  const income = parseFloat(budgetData.income);
  const savingsGoal = parseFloat(budgetData.savingsGoal);
  const monthlyLimit = parseFloat(budgetData.monthlyLimit) || Math.round(income * 0.7);

  if (isDbConnected(userId)) {
    try {
      const budget = await Budget.findOneAndUpdate(
        { user: userId },
        { income, savingsGoal, monthlyLimit },
        { new: true, upsert: true }
      );
      return {
        id: budget._id.toString(),
        income: budget.income,
        savingsGoal: budget.savingsGoal,
        monthlyLimit: budget.monthlyLimit,
      };
    } catch (err) {
      console.error("DB Save error for budget, falling back to memory:", err.message);
    }
  }

  // Memory Fallback
  const existingIndex = memoryBudgets.findIndex(b => b.user === userId);
  const budget = {
    _id: Math.random().toString(36).substr(2, 9),
    user: userId,
    income,
    savingsGoal,
    monthlyLimit,
  };

  if (existingIndex > -1) {
    memoryBudgets[existingIndex] = budget;
  } else {
    memoryBudgets.push(budget);
  }

  return {
    id: budget._id,
    income: budget.income,
    savingsGoal: budget.savingsGoal,
    monthlyLimit: budget.monthlyLimit,
  };
};

const calculateFinancialHealthScore = ({ income, expenses, savings, monthlySavings, goals }) => {
  const safeIncome = Math.max(1, income || DEFAULT_MONTHLY_INCOME);
  const expenseRatio = expenses / safeIncome;
  const savingsRate = monthlySavings / safeIncome;
  const emergencyGoal = goals.find(g => g.category === "Emergency Fund" || g.title.toLowerCase().includes("emergency"));
  const emergencyCoverageMonths = expenses > 0 && emergencyGoal ? (emergencyGoal.currentAmount || 0) / expenses : 0;

  let score = 50;
  const reasons = [];
  const recommendations = [];

  if (expenseRatio <= 0.5) {
    score += 20;
    reasons.push(`Expenses are ${Math.round(expenseRatio * 100)}% of income, which fits the 50/30/20 baseline.`);
  } else if (expenseRatio <= 0.7) {
    score += 10;
    reasons.push(`Expenses are ${Math.round(expenseRatio * 100)}% of income; manageable, but there is room to optimize.`);
    recommendations.push("Reduce wants or recurring subscriptions to bring expenses closer to 50% of income.");
  } else {
    score -= 10;
    reasons.push(`Expenses are ${Math.round(expenseRatio * 100)}% of income, leaving limited cash-flow flexibility.`);
    recommendations.push("Create a weekly spending cap and prioritize essentials until expenses fall below 70% of income.");
  }

  if (savingsRate >= 0.2) {
    score += 20;
    reasons.push(`Monthly savings rate is ${Math.round(savingsRate * 100)}%, meeting the recommended 20% target.`);
  } else if (savingsRate >= 0.1) {
    score += 10;
    reasons.push(`Monthly savings rate is ${Math.round(savingsRate * 100)}%; good start, but below the ideal 20%.`);
    recommendations.push("Increase savings by 5-10% of income before increasing lifestyle spending.");
  } else {
    score -= 12;
    reasons.push(`Monthly savings rate is only ${Math.round(savingsRate * 100)}%, below the safety threshold.`);
    recommendations.push("Automate savings at salary credit time, even if you start with a small amount.");
  }

  if (emergencyCoverageMonths >= 6) {
    score += 15;
    reasons.push(`Emergency fund covers ${emergencyCoverageMonths.toFixed(1)} months of expenses.`);
  } else if (emergencyCoverageMonths >= 3) {
    score += 8;
    reasons.push(`Emergency fund covers ${emergencyCoverageMonths.toFixed(1)} months; aim for 6 months.`);
    recommendations.push("Top up the emergency fund until it covers 6 months of expenses.");
  } else {
    score -= 8;
    reasons.push(emergencyGoal ? `Emergency fund covers only ${emergencyCoverageMonths.toFixed(1)} months.` : "No dedicated Emergency Fund goal is active.");
    recommendations.push("Create or prioritize an Emergency Fund before aggressive investing.");
  }

  if (savings > 0) {
    score += 5;
    reasons.push(`Tracked savings/goals total ₹${savings.toLocaleString("en-IN")}.`);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: finalScore,
    grade: getGradeFromScore(finalScore),
    rating: getRatingFromScore(finalScore),
    metrics: {
      income,
      expenses,
      savings,
      monthlySavings,
      expenseRatio: Math.round(expenseRatio * 100),
      savingsRate: Math.round(savingsRate * 100),
      emergencyCoverageMonths: Number(emergencyCoverageMonths.toFixed(1))
    },
    reasons: reasons.slice(0, 3),
    recommendations: recommendations.slice(0, 3)
  };
};

// Helper function to call Gemini or OpenAI API directly
const callLLM = async (prompt, systemInstruction = "") => {
  const apiKey = config.GEMINI_API_KEY;
  const openAiKey = config.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: systemInstruction ? `${systemInstruction}\n\nUser Message:\n${prompt}` : prompt }
            ]
          }
        ]
      };
      const response = await axios.post(url, payload, { timeout: 8000 });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.error("❌ Gemini API call failed:", err.message);
    }
  }

  if (openAiKey) {
    try {
      const url = `https://api.openai.com/v1/chat/completions`;
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt }
        ]
      };
      const headers = { Authorization: `Bearer ${openAiKey}` };
      const response = await axios.post(url, payload, { headers, timeout: 8000 });
      const text = response.data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (err) {
      console.error("❌ OpenAI API call failed:", err.message);
    }
  }

  return null;
};

// Helper to save a chat message
const saveChatMessage = async (userId, role, content) => {
  if (isDbConnected(userId)) {
    try {
      await ChatHistory.create({ user: userId, role, content });
    } catch (err) {
      console.error("Failed to save chat history to database:", err.message);
    }
  } else {
    memoryChatHistory.push({
      _id: Math.random().toString(36).substr(2, 9),
      user: userId,
      role,
      content,
      timestamp: new Date()
    });
  }
};

const fetchConversationHistory = async (userId, limit = 10) => {
  if (isDbConnected(userId)) {
    try {
      const history = await ChatHistory.find({ user: userId }).sort({ timestamp: 1 }).limit(limit);
      return history.map((item) => ({
        role: item.role,
        content: item.content,
      }));
    } catch (err) {
      console.error("Failed to fetch chat history:", err.message);
    }
  }

  return memoryChatHistory
    .filter((item) => item.user === userId)
    .slice(-limit)
    .map((item) => ({
      role: item.role,
      content: item.content,
    }));
};

// EXPENSE OPERATIONS
export const fetchExpenses = async (userId) => {
  if (isDbConnected(userId)) {
    try {
      const dbExpenses = await Expense.find({ user: userId }).sort({ date: -1 });
      return dbExpenses.map(e => ({
        id: e._id.toString(),
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date.toISOString().split("T")[0]
      }));
    } catch (err) {
      console.error("DB Query error for expenses, falling back to memory:", err.message);
    }
  }
  // Filter memory list strictly by userId — no shared demo data
  const userExpenses = memoryExpenses.filter(e => e.user === userId);
  return userExpenses.map(e => ({
    id: e._id,
    title: e.title,
    amount: e.amount,
    category: e.category,
    date: typeof e.date === "string" ? e.date : e.date.toISOString().split("T")[0]
  }));
};

export const createExpense = async (userId, expenseData) => {
  if (isDbConnected(userId)) {
    try {
      const newExpense = new Expense({ user: userId, ...expenseData });
      const saved = await newExpense.save();
      return {
        id: saved._id.toString(),
        title: saved.title,
        amount: saved.amount,
        category: saved.category,
        date: saved.date.toISOString().split("T")[0]
      };
    } catch (err) {
      console.error("DB Save error for expense, falling back to memory:", err.message);
    }
  }
  const newExpense = {
    _id: Math.random().toString(36).substr(2, 9),
    user: userId,
    ...expenseData,
  };
  memoryExpenses.unshift(newExpense);
  return {
    id: newExpense._id,
    title: newExpense.title,
    amount: newExpense.amount,
    category: newExpense.category,
    date: newExpense.date
  };
};

export const removeExpense = async (userId, id) => {
  if (isDbConnected(userId)) {
    try {
      await Expense.findOneAndDelete({ _id: id, user: userId });
      return true;
    } catch (err) {
      console.error("DB Delete error for expense, falling back to memory:", err.message);
    }
  }
  memoryExpenses = memoryExpenses.filter(e => !(e._id === id && (e.user === userId || e.user === "default_user")));
  return true;
};

// GOALS OPERATIONS
export const fetchGoals = async (userId) => {
  if (isDbConnected(userId)) {
    try {
      const dbGoals = await Goal.find({ user: userId });
      // Clean slate: return empty array for new users — no auto-seeding
      return dbGoals.map(g => ({
        id: g._id.toString(),
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        monthlyContribution: g.monthlyContribution || 0,
        targetDate: g.targetDate ? g.targetDate.toISOString().split("T")[0] : null,
        category: g.category
      }));
    } catch (err) {
      console.error("DB Query error for goals, falling back to memory:", err.message);
    }
  }
  // Filter strictly by userId — no shared/default goals
  const userGoals = memoryGoals.filter(g => g.user === userId);
  return userGoals.map(g => ({
    id: g._id,
    title: g.title,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    monthlyContribution: g.monthlyContribution || 0,
    targetDate: g.targetDate || null,
    category: g.category
  }));
};

export const createGoal = async (userId, goalData) => {
  if (isDbConnected(userId)) {
    try {
      const newGoal = new Goal({ user: userId, ...goalData });
      const saved = await newGoal.save();
      return {
        id: saved._id.toString(),
        title: saved.title,
        targetAmount: saved.targetAmount,
        currentAmount: saved.currentAmount,
        monthlyContribution: saved.monthlyContribution || 0,
        targetDate: saved.targetDate ? saved.targetDate.toISOString().split("T")[0] : null,
        category: saved.category
      };
    } catch (err) {
      console.error("DB Save error for goal, falling back to memory:", err.message);
    }
  }
  const newGoal = {
    _id: Math.random().toString(36).substr(2, 9),
    user: userId,
    ...goalData,
    currentAmount: goalData.currentAmount || 0,
    monthlyContribution: goalData.monthlyContribution || 0,
    targetDate: goalData.targetDate || null
  };
  memoryGoals.push(newGoal);
  return {
    id: newGoal._id,
    title: newGoal.title,
    targetAmount: newGoal.targetAmount,
    currentAmount: newGoal.currentAmount,
    monthlyContribution: newGoal.monthlyContribution,
    targetDate: newGoal.targetDate,
    category: newGoal.category
  };
};

export const updateGoalProgress = async (userId, id, contribution) => {
  const amount = parseFloat(contribution);
  if (isNaN(amount)) throw new Error("Invalid contribution amount");

  if (isDbConnected(userId)) {
    try {
      const goal = await Goal.findOne({ _id: id, user: userId });
      if (!goal) throw new Error("Goal not found");
      goal.currentAmount = (goal.currentAmount || 0) + amount;
      const saved = await goal.save();
      return {
        id: saved._id.toString(),
        title: saved.title,
        targetAmount: saved.targetAmount,
        currentAmount: saved.currentAmount,
        monthlyContribution: saved.monthlyContribution || 0,
        targetDate: saved.targetDate ? saved.targetDate.toISOString().split("T")[0] : null,
        category: saved.category
      };
    } catch (err) {
      console.error("DB update error for goal, falling back to memory:", err.message);
    }
  }
  const goalIndex = memoryGoals.findIndex(g => g._id === id && g.user === userId);
  if (goalIndex === -1) throw new Error("Goal not found");
  memoryGoals[goalIndex].currentAmount += amount;
  const updated = memoryGoals[goalIndex];
  return {
    id: updated._id,
    title: updated.title,
    targetAmount: updated.targetAmount,
    currentAmount: updated.currentAmount,
    monthlyContribution: updated.monthlyContribution || 0,
    targetDate: updated.targetDate || null,
    category: updated.category
  };
};

export const removeGoal = async (userId, id) => {
  if (isDbConnected(userId)) {
    try {
      await Goal.findOneAndDelete({ _id: id, user: userId });
      return true;
    } catch (err) {
      console.error("DB Delete error for goal, falling back to memory:", err.message);
    }
  }
  memoryGoals = memoryGoals.filter(g => !(g._id === id && (g.user === userId || g.user === "default_user")));
  return true;
};

// DASHBOARD & ANALYTICS DATA
export const fetchDashboardData = async (userId) => {
  const expenses = await fetchExpenses(userId);
  const goals = await fetchGoals(userId);
  const budgetSnapshot = await getBudgetSnapshot(userId, expenses, goals);
  const financialHealth = calculateFinancialHealthScore({ ...budgetSnapshot, goals });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();

  // 1. Calculate Monthly Expenses
  const currentMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // 2. Calculate Emergency Fund Status
  const emergency = goals.find(g => g.category === "Emergency Fund" || g.title.toLowerCase().includes("emergency"));
  const emergencyVal = emergency ? `₹${emergency.currentAmount.toLocaleString("en-IN")}` : "₹0";
  const emergencyStatus = emergency
    ? `${Math.round((emergency.currentAmount / emergency.targetAmount) * 100)}% Funded`
    : "0% Funded (Create Goal)";

  // 3. Net Worth — only actual tracked goal savings, no fake base amount
  const totalGoalsSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const netWorthVal = totalGoalsSavings > 0
    ? `₹${totalGoalsSavings.toLocaleString("en-IN")}`
    : "₹0";

  // 4. Calculate Expense Breakdown Pie Chart — empty array for new users (no fake data)
  const categories = {};
  expenses.forEach(e => {
    const cat = e.category;
    categories[cat] = (categories[cat] || 0) + e.amount;
  });
  const expenseBreakdown = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat]
  }));

  // 5. Calculate comparative Monthly Expenses vs Savings Trend (Last 6 Months)
  const trendMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    trendMap[monthName] = { expenses: 0, savings: 0 };
  }

  expenses.forEach(e => {
    const expenseDate = new Date(e.date);
    const monthName = months[expenseDate.getMonth()];
    if (trendMap[monthName] !== undefined) {
      trendMap[monthName].expenses += e.amount;
    }
  });

  // Calculate savings dynamically against user's actual income
  const incomeRate = budgetSnapshot.income;
  const expenseTrend = Object.keys(trendMap).map(m => {
    const monthlySpend = trendMap[m].expenses;
    // Only show real data — no random fake values for months with no expenses
    const finalSpend = monthlySpend;
    const finalSavings = finalSpend > 0 ? Math.max(0, incomeRate - finalSpend) : 0;
    return {
      month: m,
      expenses: finalSpend,
      savings: finalSavings,
      income: finalSpend > 0 ? incomeRate : 0
    };
  });

  // 6. Calculate Goal Progress List
  const goalProgress = goals.map(g => ({
    id: g.id || g._id,
    title: g.title,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    percentage: Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)
  }));

  // 7. Spending Alerts Engine
  const currentMonth = now.getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentYear = now.getFullYear();
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthCategoryMap = {};
  const lastMonthCategoryMap = {};

  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      currentMonthCategoryMap[e.category] = (currentMonthCategoryMap[e.category] || 0) + e.amount;
    } else if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) {
      lastMonthCategoryMap[e.category] = (lastMonthCategoryMap[e.category] || 0) + e.amount;
    }
  });

  const spendingAlerts = [];
  Object.keys(currentMonthCategoryMap).forEach(cat => {
    const currentAmount = currentMonthCategoryMap[cat];
    const lastAmount = lastMonthCategoryMap[cat] || 0;

    if (lastAmount > 0) {
      const increase = currentAmount - lastAmount;
      const pct = (increase / lastAmount) * 100;
      if (pct > 15 && increase > 500) {
        spendingAlerts.push({
          category: cat,
          message: `${cat} spending has increased by ${Math.round(pct)}% (+₹${increase.toLocaleString("en-IN")}) compared to last month.`
        });
      }
    }
  });

  // 8. AI Insights Bullet Points — only derived from real data
  const rentExpenses = expenses.filter(e => e.category.toLowerCase() === "rent").reduce((sum, e) => sum + e.amount, 0);
  const aiInsights = expenses.length > 0 ? [
    rentExpenses > 0
      ? `Rent consumes ${Math.round((rentExpenses / incomeRate) * 100)}% of your monthly net income target.`
      : "No rent expenses logged. If you pay rent, log it to track your housing cost ratio.",
    emergency
      ? `Emergency Fund is ${Math.round((emergency.currentAmount / emergency.targetAmount) * 100)}% complete.`
      : "No Emergency Fund established. Create one to protect your liquid cash.",
    currentMonthExpenses > 35000
      ? "Warning: Spending rate is elevated this month. Consolidate discretionary outlays."
      : "Monthly spending rate is well under target. Consider investing the surplus."
  ] : [
    "Log your first expense to start tracking your financial health.",
    "Set a budget in the Budget Planner to see your 50/30/20 breakdown.",
    "Create a savings goal to begin tracking your wealth-building progress."
  ];

  return {
    stats: {
      netWorth: { value: netWorthVal, status: totalGoalsSavings > 0 ? "+8% this month" : "No data yet" },
      emergencyFund: { value: emergencyVal, status: emergencyStatus },
      monthlyExpenses: { value: currentMonthExpenses > 0 ? `₹${currentMonthExpenses.toLocaleString("en-IN")}` : "₹0", status: currentMonthExpenses > 0 ? (currentMonthExpenses > 35000 ? "Over Budget" : "Under Budget") : "No expenses logged" },
      investmentGrowth: { value: goals.length > 0 ? "+14.8%" : "+0%", status: goals.length > 0 ? "Outperforming Market" : "Add your data" },
    },
    secondary: {
      financialHealth: {
        score: expenses.length > 0 || goals.length > 0 ? financialHealth.score : 0,
        grade: expenses.length > 0 || goals.length > 0 ? financialHealth.grade : "—",
        rating: expenses.length > 0 || goals.length > 0 ? financialHealth.rating : "No data",
        metrics: financialHealth.metrics
      },
      goalsActive: { count: goals.length, status: goals.length > 0 ? "On Track" : "None yet" },
      riskProfile: { level: goals.length > 0 ? "Low-Moderate" : "—", rating: goals.length > 0 ? "Healthy" : "—" },
    },
    chartData: expenseTrend,
    expenseBreakdown,
    expenseTrend,
    goalProgress,
    spendingAlerts,
    aiInsights,
    aiRecommendation: {
      suggestion: expenses.length > 0 || goals.length > 0
        ? `Based on your monthly expenses of ₹${currentMonthExpenses.toLocaleString("en-IN")}, your Emergency Fund covers ${emergency ? (emergency.currentAmount / Math.max(1, currentMonthExpenses)).toFixed(1) : 0} months. Increasing it would hit the ideal 6-month safety net threshold.`
        : "Add your income in Budget Planner and log your first expense to unlock AI-powered financial insights.",
      footer: expenses.length > 0 || goals.length > 0
        ? "Insight dynamically formulated based on your current liquid cash and savings rate."
        : "Personalized insights appear once you have at least one expense recorded."
    }
  };
};

// FINANCIAL HEALTH SCORE ANALYZER
export const fetchFinancialHealth = async (userId) => {
  const expenses = await fetchExpenses(userId);
  const goals = await fetchGoals(userId);
  const budgetSnapshot = await getBudgetSnapshot(userId, expenses, goals);
  const localReport = calculateFinancialHealthScore({ ...budgetSnapshot, goals });

  const prompt = `Perform a financial health check based on the user's data:
Income: ${budgetSnapshot.income}
Monthly Expenses: ${budgetSnapshot.expenses}
Tracked Savings: ${budgetSnapshot.savings}
Expenses: ${JSON.stringify(expenses)}
Goals: ${JSON.stringify(goals)}

Generate a detailed financial health report in EXACT JSON format. Do not include any markdown format tags like \`\`\`json or text wrapper, return only the raw JSON string:
{
  "score": ${localReport.score},
  "grade": "${localReport.grade}",
  "rating": "${localReport.rating}",
  "reasons": ["Reason 1", "Reason 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  const llmResult = await callLLM(prompt, "You are a financial health audit bot. You analyze expenses, budgets, and savings goals to calculate health score metrics.");

  if (llmResult) {
    try {
      // Strip out any code blocks if the LLM returned it
      const cleanJson = llmResult.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.score !== undefined && parsed.reasons && parsed.recommendations) {
        const safeScore = Math.max(0, Math.min(100, Math.round(parsed.score)));
        return {
          ...localReport,
          ...parsed,
          score: safeScore,
          grade: parsed.grade || getGradeFromScore(safeScore),
          rating: parsed.rating || getRatingFromScore(safeScore),
          metrics: localReport.metrics
        };
      }
    } catch (e) {
      console.warn("LLM health report JSON parsing failed, falling back to local analysis:", e.message);
    }
  }

  // Fallback to local custom analytical engine
  return localReport;
};

const generateLocalFinancialHealth = (expenses, goals) => {
  let score = 84;
  const reasons = [];
  const recommendations = [];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const emergencyFundGoal = goals.find(g => g.category === "Emergency Fund" || g.title.toLowerCase().includes("emergency"));
  const rentExpenses = expenses.filter(e => e.category.toLowerCase() === "rent").reduce((sum, e) => sum + e.amount, 0);
  const monthlyLimit = 35000;

  if (totalExpenses > monthlyLimit) {
    score -= 10;
    reasons.push(`Total monthly spending of ₹${totalExpenses.toLocaleString("en-IN")} exceeds target budget limit of ₹${monthlyLimit.toLocaleString("en-IN")}`);
    recommendations.push("Implement a 50/30/20 budgeting rule to constrain discretionary outlays");
  } else {
    reasons.push("Monthly expenditures are currently well-managed under your target limit");
  }

  if (rentExpenses > 0) {
    const rentRatio = (rentExpenses / monthlyLimit) * 100;
    if (rentRatio > 40) {
      score -= 8;
      reasons.push(`Rent consumes ${Math.round(rentRatio)}% of your monthly expenditure target (ideal is under 30%)`);
      recommendations.push("Explore housing cost reductions or target secondary income sources to ease cash flow");
    }
  }

  if (emergencyFundGoal) {
    const fundPercentage = Math.round((emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100);
    if (fundPercentage < 50) {
      score -= 12;
      reasons.push(`Emergency Fund is only ${fundPercentage}% funded (aim for 6 months of expenses)`);
      recommendations.push("Prioritize contributions to your Emergency Fund to establish a robust safety net");
    } else {
      reasons.push(`Emergency Fund is healthy and ${fundPercentage}% complete`);
    }
  } else {
    score -= 15;
    reasons.push("No dedicated Emergency Fund savings goal established");
    recommendations.push("Create a new Emergency Fund goal immediately to secure 3-6 months of expenses");
  }

  const foodExpenses = expenses.filter(e => e.category.toLowerCase() === "food").reduce((sum, e) => sum + e.amount, 0);
  if (foodExpenses > 8000) {
    score -= 5;
    reasons.push("Food/grocery spending is elevated relative to standard budget allocations");
    recommendations.push("Track dining out vs home-cooked groceries to reduce dining leakages");
  }

  return {
    score: Math.max(30, Math.min(100, score)),
    reasons,
    recommendations
  };
};

// BUDGET ANALYZER — 50/30/20 Rule
// Categorizes expenses and computes Needs/Wants/Savings split
const NEEDS_CATEGORIES = ["rent", "bills", "groceries", "fuel", "insurance", "utilities", "transport", "medical"];
const WANTS_CATEGORIES = ["dining", "food", "entertainment", "shopping", "subscriptions", "netflix", "lifestyle", "travel", "vacation"];

export const fetchBudgetAnalysis = async (userId) => {
  const expenses = await fetchExpenses(userId);
  const goals = await fetchGoals(userId);
  const budgetSnapshot = await getBudgetSnapshot(userId, expenses, goals);
  const income = budgetSnapshot.income;
  const safeIncome = Math.max(1, income);

  let needsAmount = 0;
  let wantsAmount = 0;

  expenses.forEach(e => {
    const cat = e.category.toLowerCase();
    if (NEEDS_CATEGORIES.some(n => cat.includes(n))) {
      needsAmount += e.amount;
    } else if (WANTS_CATEGORIES.some(w => cat.includes(w))) {
      wantsAmount += e.amount;
    } else {
      // Default uncategorized to needs
      needsAmount += e.amount;
    }
  });

  const totalGoalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const savingsAmount = Math.max(0, income - needsAmount - wantsAmount);

  const needsPct = Math.round((needsAmount / safeIncome) * 100);
  const wantsPct = Math.round((wantsAmount / safeIncome) * 100);
  const savingsPct = Math.max(0, Math.round((savingsAmount / safeIncome) * 100));

  // Score based on 50/30/20 alignment
  let score = 50;
  if (needsPct <= 50) score += 20;
  else if (needsPct <= 60) score += 10;
  else score -= 10;

  if (savingsPct >= 20) score += 20;
  else if (savingsPct >= 10) score += 10;
  else score -= 5;

  if (wantsPct <= 30) score += 10;
  else score -= 5;

  score = Math.max(0, Math.min(100, score));

  const alerts = [];
  if (needsPct > 50) alerts.push(`Needs are ${needsPct}% of income — above the 50% threshold.`);
  if (wantsPct > 30) alerts.push(`Wants are ${wantsPct}% of income — above the 30% target.`);
  if (savingsPct < 20) alerts.push(`Savings rate is ${savingsPct}% — below the recommended 20%.`);

  let verdict = "Your spending aligns well with the 50/30/20 rule.";
  if (alerts.length === 1) verdict = `Minor adjustment needed: ${alerts[0]}`;
  else if (alerts.length >= 2) verdict = "Your budget needs rebalancing across multiple categories.";

  return {
    needs: needsPct,
    wants: wantsPct,
    savings: savingsPct,
    needsAmount,
    wantsAmount,
    savingsAmount,
    totalGoalSavings,
    income,
    score,
    verdict,
    alerts
  };
};


// CHATBOT ADVISOR WITH HISTORY AND FORECASTING
export const generateChatResponse = async (userId, message) => {
  const expenses = await fetchExpenses(userId);
  const goals = await fetchGoals(userId);

  const expensesSummary = expenses.map(e => `- ${e.title} (${e.category}): ₹${e.amount} on ${e.date}`).join("\n");
  const goalsSummary = goals.map(g => {
    const remaining = g.targetAmount - g.currentAmount;
    const monthsEst = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : null;
    return `- ${g.title} (${g.category}): ₹${g.currentAmount} / ₹${g.targetAmount}${monthsEst ? ` — ~${monthsEst} months remaining` : ""}`;
  }).join("\n");

  // Fetch budget analysis for AI context
  let budgetContext = "";
  try {
    const budget = await fetchBudgetAnalysis(userId);
    budgetContext = `\nBudget Analysis (50/30/20):\nNeeds: ${budget.needs}% | Wants: ${budget.wants}% | Savings: ${budget.savings}%\nBudget Score: ${budget.score}/100\nVerdict: ${budget.verdict}`;
  } catch (e) {
    // non-critical, skip
  }

  const systemPrompt = `You are Future Finance AI, a personal financial advisor. Analyze the user's financial profile and answer their query.

User Current Data:
Expenses Logged:
${expensesSummary || "None logged yet"}

Active Savings Goals:
${goalsSummary || "None set yet"}
${budgetContext}

Guidelines:
1. Provide short, concise, highly professional, and actionable financial advice.
2. If the user asks about timelines or forecasting (e.g. "Can I reach my car goal by December?"), calculate the completion date based on contribution rates and target amounts. State the estimated completion month/year, and what contribution would be required to meet their deadline.
3. If the user asks about their budget, use the Budget Analysis data above to give precise percentage-based advice and suggest how to increase savings by a specific rupee amount.
4. Identify spending patterns or high rent ratios if relevant.
5. At the very end of your response, output a list of 3 suggested next actions in this exact format:
[SUGGESTED_ACTIONS]: ["Action 1", "Action 2", "Action 3"]
Relevant actions: "View Expense Breakdown", "Create Emergency Fund", "Increase Savings Goal", "Review Spending Patterns", "Analyze Budget", etc. Keep them to single short lines.`;

  // Fetch conversation memory
  const conversationHistory = await fetchConversationHistory(userId, 10);
  const historyPrompt = conversationHistory
    .map((item) => `${item.role === "user" ? "User" : "AI"}: ${item.content}`)
    .join("\n");

  const prompt = `${historyPrompt ? `${historyPrompt}\n` : ""}User: ${message}\nAI:`;

  // Save user's message
  await saveChatMessage(userId, "user", message);

  let reply = null;

  // Try n8n Webhook
  const n8nUrl = config.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      // Fetch budget settings
      let budgetIncome = 30000;
      if (isDbConnected(userId)) {
        try {
          const budget = await Budget.findOne({ user: userId });
          if (budget) {
            budgetIncome = budget.income;
          }
        } catch (e) {
          console.warn("Failed to find budget details:", e.message);
        }
      }

      const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalGoalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
      const primaryGoal = goals.length > 0 ? goals[0].title : "Emergency Fund";

      const financialData = {
        income: budgetIncome,
        expenses: totalExpenseAmount,
        savings: totalGoalSavings,
        goal: primaryGoal
      };

      console.log(`📡 Outgoing: Querying n8n agent at ${n8nUrl} with structured context...`);
      const conversationTranscript = historyPrompt || "No prior conversation yet.";
      const n8nMessage = [
        "Conversation History:",
        conversationTranscript,
        "",
        `Latest User Question: ${message}`
      ].join("\n");
      const response = await axios.post(
        n8nUrl,
        {
          message: n8nMessage,
          latestMessage: message,
          financialData,
          conversationHistory,
          conversationTranscript
        },
        { timeout: 4000 }
      );
      reply = response.data?.reply || response.data?.response || response.data?.output;
      if (reply) {
        console.log("✅ Incoming: Response received from n8n workflow.");
      }
    } catch (error) {
      console.warn("⚠️ n8n Webhook call failed, checking direct LLM keys:", error.message);
    }
  }

  // Try Direct LLM Call (Gemini/OpenAI)
  if (!reply) {
    reply = await callLLM(prompt, systemPrompt);
  }

  // Fallback to local rule engine
  if (!reply) {
    console.log("⚠️ Running in fallback local rules engine advisor mode.");
    reply = generateFallbackRulesResponse(message, expenses, goals);
  }

  // Parse suggested actions
  let suggestedActions = ["View Expense Breakdown", "Create Emergency Fund", "Increase Savings Goal"];
  const actionMarker = "[SUGGESTED_ACTIONS]:";
  if (reply.includes(actionMarker)) {
    const parts = reply.split(actionMarker);
    reply = parts[0].trim();
    try {
      const actionsJson = parts[1].trim();
      suggestedActions = JSON.parse(actionsJson);
    } catch (e) {
      const matches = parts[1].match(/"([^"]+)"/g);
      if (matches) {
        suggestedActions = matches.map(m => m.replace(/"/g, ""));
      }
    }
  }

  // Save AI's response
  await saveChatMessage(userId, "assistant", reply);

  return { reply, suggestedActions };
};

const generateFallbackRulesResponse = (message, expenses, goals) => {
  const text = message.toLowerCase();
  let response = "";

  if (text.includes("how much should i save")) {
    response = "Aim for 20–30% of your monthly income. Our Budget Planner page can help you model this accurately based on your personal savings goals.";
  } else if (text.includes("save") || text.includes("saving")) {
    response = "A general rule of thumb is to save 20% of your net income. If you have aggressive goals (like buying a home or early retirement), aiming for 30% or more is recommended.";
  } else if (text.includes("budget") || text.includes("50/30/20")) {
    response = "The 50/30/20 rule is an excellent budget model: 50% for Needs (rent, essentials), 30% for Wants (lifestyle), and 20% for Savings and investments.";
  } else if (text.includes("expense") || text.includes("track")) {
    response = "You can use our built-in Expense Tracker page to log your expenditures in real time, view visual category charts, and verify whether you stay under your monthly limit.";
  } else if (text.includes("invest") || text.includes("stock") || text.includes("mutual fund")) {
    response = "Once you establish a 3-6 month emergency fund, consider putting your savings into diversified index funds, stocks, or mutual funds to grow your long-term wealth.";
  } else if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    response = "Hello! How can I help you optimize your finances today?";
  } else if (text.includes("goal") || text.includes("timeline") || text.includes("forecast") || text.includes("reach") || text.includes("car") || text.includes("emergency")) {
    if (goals.length > 0) {
      const activeGoal = goals[0];
      const remaining = activeGoal.targetAmount - activeGoal.currentAmount;
      const rate = 10000;
      const months = Math.ceil(remaining / rate);
      response = `Based on your first goal "${activeGoal.title}" (target ₹${activeGoal.targetAmount.toLocaleString("en-IN")}, current ₹${activeGoal.currentAmount.toLocaleString("en-IN")}), you have ₹${remaining.toLocaleString("en-IN")} remaining. At an estimated monthly savings rate of ₹${rate.toLocaleString("en-IN")}/month, you will reach this goal in approximately ${months} months. To hit a target by Dec 2026, you would need to adjust your contributions to approximately ₹${Math.round(remaining / 18)}/month.`;
    } else {
      response = "You don't have any active savings goals set. Create a goal on the Savings Goals page to model your timelines!";
    }
  } else {
    response = "I am your AI Financial Advisor. You can ask me questions about savings rate targets, budget allocations, tracking expenses, or emergency funds!";
  }

  return `${response}\n\n[SUGGESTED_ACTIONS]: ["View Expense Breakdown", "Create Emergency Fund", "Increase Savings Goal"]`;
};
