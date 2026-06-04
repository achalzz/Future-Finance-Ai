import { generateMonthlyReport } from "../services/report.service.js";

// PDF Monthly Report download controller
export const downloadMonthlyReport = async (req, res) => {
  try {
    const pdfBuffer = await generateMonthlyReport(req.user.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="future-finance-report-${new Date().toISOString().slice(0, 7)}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Report generation failed:", error.message);
    return res.status(500).json({ error: "Failed to generate report: " + error.message });
  }
};
