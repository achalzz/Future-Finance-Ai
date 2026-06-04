import { api } from "./api";

export const downloadMonthlyReport = async (): Promise<void> => {
  const response = await api.get("/reports/monthly", { responseType: "blob" });
  const url = URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = document.createElement("a");
  link.href = url;
  const month = new Date().toISOString().slice(0, 7);
  link.download = `future-finance-report-${month}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
