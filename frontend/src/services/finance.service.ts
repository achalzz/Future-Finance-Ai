import { api } from "./api";

export interface Budget {
  id?: string;
  income: number;
  savingsGoal: number;
  monthlyLimit?: number;
}

export const getDashboardData = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getBudget = async (): Promise<Budget> => {
  const response = await api.get("/budget");
  return response.data;
};

export const saveBudget = async (budgetData: Budget): Promise<Budget> => {
  const response = await api.post("/budget", budgetData);
  return response.data;
};
