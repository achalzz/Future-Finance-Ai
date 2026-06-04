import PDFDocument from "pdfkit";
import {
  fetchExpenses,
  fetchGoals,
  fetchBudgetAnalysis,
  fetchFinancialHealth,
} from "./finance.service.js";


// Helper: draw a horizontal rule line
const drawLine = (doc, y) => {
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#2d3748").lineWidth(1).stroke();
};

// Helper: draw a progress bar
const drawProgressBar = (doc, x, y, width, percent, color) => {
  const barHeight = 8;
  doc.rect(x, y, width, barHeight).fillColor("#1e2d3d").fill();
  const filled = Math.min(100, Math.max(0, percent));
  if (filled > 0) {
    doc.rect(x, y, (width * filled) / 100, barHeight).fillColor(color).fill();
  }
};

export const generateMonthlyReport = async (userId) => {
  // Gather all data
  const [expenses, goals, healthReport] = await Promise.all([
    fetchExpenses(userId),
    fetchGoals(userId),
    fetchFinancialHealth(userId),
  ]);

  let budgetAnalysis = null;
  try {
    budgetAnalysis = await fetchBudgetAnalysis(userId);
  } catch (e) {
    // non-critical
  }

  const now = new Date();
  const monthName = now.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const income = budgetAnalysis?.income || 30000;
  const savings = Math.max(0, income - totalExpenses);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── HEADER ──────────────────────────────────────────────────────────────────
    doc.rect(0, 0, 595, 120).fillColor("#0a0f1e").fill();

    doc
      .fillColor("#22d3ee")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Future Finance AI", 50, 35);

    doc
      .fillColor("#94a3b8")
      .font("Helvetica")
      .fontSize(11)
      .text("Monthly Financial Report", 50, 62);

    doc
      .fillColor("#64748b")
      .fontSize(10)
      .text(`Generated: ${monthName}`, 50, 80)
      .text(`Report Date: ${now.toLocaleDateString("en-IN")}`, 50, 95);

    doc.fillColor("#22d3ee").text("Future Finance AI", 400, 62, { align: "right" });

    // ── FINANCIAL SUMMARY ────────────────────────────────────────────────────────
    let y = 140;
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("Financial Summary", 50, y);
    y += 25;
    drawLine(doc, y);
    y += 15;

    const summaryItems = [
      { label: "Monthly Income", value: `₹${income.toLocaleString("en-IN")}`, color: "#22d3ee" },
      { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}`, color: "#f43f5e" },
      { label: "Net Savings", value: `₹${savings.toLocaleString("en-IN")}`, color: "#10b981" },
      { label: "Savings Rate", value: `${Math.round((savings / Math.max(1, income)) * 100)}%`, color: "#a78bfa" },
    ];

    summaryItems.forEach((item, i) => {
      const col = i % 2 === 0 ? 50 : 300;
      const row = y + Math.floor(i / 2) * 55;
      doc.rect(col, row, 220, 45).fillColor("#0d1829").fill();
      doc.fillColor("#64748b").font("Helvetica").fontSize(9).text(item.label, col + 12, row + 8);
      doc.fillColor(item.color).font("Helvetica-Bold").fontSize(16).text(item.value, col + 12, row + 20);
    });

    y += 120;

    // ── FINANCIAL HEALTH SCORE ───────────────────────────────────────────────────
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("Financial Health Score", 50, y);
    y += 25;
    drawLine(doc, y);
    y += 15;

    const scoreColor = healthReport.score >= 80 ? "#10b981" : healthReport.score >= 60 ? "#22d3ee" : "#f43f5e";
    doc.rect(50, y, 495, 60).fillColor("#0d1829").fill();
    doc.fillColor(scoreColor).font("Helvetica-Bold").fontSize(36).text(`${healthReport.score}`, 70, y + 10);
    doc.fillColor("#94a3b8").font("Helvetica").fontSize(11).text("/ 100", 130, y + 25);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13).text(`Grade ${healthReport.grade || "B"} — ${healthReport.rating || "Good"}`, 200, y + 10);

    if (healthReport.reasons && healthReport.reasons.length > 0) {
      doc.fillColor("#64748b").font("Helvetica").fontSize(9).text(healthReport.reasons[0], 200, y + 30, { width: 320 });
    }

    y += 80;

    // ── BUDGET ANALYSIS (50/30/20) ────────────────────────────────────────────────
    if (budgetAnalysis) {
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("Budget Analysis (50/30/20 Rule)", 50, y);
      y += 25;
      drawLine(doc, y);
      y += 15;

      const budgetItems = [
        { label: "Needs", pct: budgetAnalysis.needs, target: 50, color: "#22d3ee" },
        { label: "Wants", pct: budgetAnalysis.wants, target: 30, color: "#a78bfa" },
        { label: "Savings", pct: budgetAnalysis.savings, target: 20, color: "#10b981" },
      ];

      budgetItems.forEach((item) => {
        doc.fillColor("#94a3b8").font("Helvetica").fontSize(10).text(item.label, 50, y);
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(`${item.pct}%`, 150, y);
        doc.fillColor("#64748b").fontSize(9).text(`(Target: ${item.target}%)`, 190, y);
        drawProgressBar(doc, 50, y + 14, 495, item.pct, item.color);
        y += 35;
      });

      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(9)
        .text(`AI Verdict: ${budgetAnalysis.verdict}`, 50, y, { width: 495 });
      y += 30;
    }

    // ── GOALS PROGRESS ────────────────────────────────────────────────────────────
    if (goals.length > 0) {
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("Savings Goals Progress", 50, y);
      y += 25;
      drawLine(doc, y);
      y += 15;

      goals.slice(0, 5).forEach((goal) => {
        const pct = Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100));
        const barColor = pct >= 75 ? "#10b981" : pct >= 40 ? "#22d3ee" : "#f43f5e";
        const remaining = goal.targetAmount - (goal.currentAmount || 0);
        const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(goal.title, 50, y);
        doc.fillColor("#64748b").font("Helvetica").fontSize(9)
          .text(`₹${(goal.currentAmount || 0).toLocaleString("en-IN")} / ₹${goal.targetAmount.toLocaleString("en-IN")}  •  ${pct}% complete${monthsLeft ? `  •  ~${monthsLeft} months remaining` : ""}`, 50, y + 13);
        drawProgressBar(doc, 50, y + 28, 495, pct, barColor);
        y += 50;
      });
    }

    // ── EXPENSES BREAKDOWN ────────────────────────────────────────────────────────
    if (expenses.length > 0) {
      const categories = {};
      expenses.forEach((e) => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });

      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("Expense Breakdown", 50, y);
      y += 25;
      drawLine(doc, y);
      y += 15;

      const colors = ["#22d3ee", "#3b82f6", "#a78bfa", "#f472b6", "#fb7185", "#10b981"];
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .forEach(([cat, amt], i) => {
          const pct = Math.round((amt / Math.max(1, totalExpenses)) * 100);
          doc.fillColor(colors[i % colors.length]).font("Helvetica-Bold").fontSize(10).text(`${cat}`, 50, y);
          doc.fillColor("#ffffff").text(`₹${amt.toLocaleString("en-IN")}  (${pct}%)`, 250, y);
          y += 20;
        });
    }

    // ── AI RECOMMENDATIONS ─────────────────────────────────────────────────────────
    if (healthReport.recommendations && healthReport.recommendations.length > 0) {
      y += 10;
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("AI Recommendations", 50, y);
      y += 25;
      drawLine(doc, y);
      y += 15;

      healthReport.recommendations.forEach((rec, i) => {
        doc.fillColor("#22d3ee").font("Helvetica-Bold").fontSize(10).text(`${i + 1}.`, 50, y);
        doc.fillColor("#94a3b8").font("Helvetica").fontSize(10).text(rec, 70, y, { width: 475 });
        y += 30;
      });
    }

    // ── FOOTER ─────────────────────────────────────────────────────────────────────
    doc.rect(0, 780, 595, 62).fillColor("#0a0f1e").fill();
    doc.fillColor("#334155").font("Helvetica").fontSize(8)
      .text("This report is generated by Future Finance AI for informational purposes only.", 50, 795, { align: "center", width: 495 })
      .text("It does not constitute formal financial advice. Please consult a certified financial advisor for personalized guidance.", 50, 808, { align: "center", width: 495 });

    doc.end();
  });
};
