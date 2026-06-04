import { api } from "./api";
import type { Expense } from "../types/finance.types";

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get("/expenses");
  return response.data;
};

export const addExpense = async (expense: Omit<Expense, "id">): Promise<Expense> => {
  const response = await api.post("/expenses", expense);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};
