import { api } from "./api";

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  monthlyContribution: number;
  targetDate: string | null;
}

export const getGoals = async (): Promise<Goal[]> => {
  const response = await api.get("/goals");
  return response.data;
};

export const addGoal = async (
  goal: Omit<Goal, "id" | "currentAmount">
): Promise<Goal> => {
  const response = await api.post("/goals", goal);
  return response.data;
};

export const contributeToGoal = async (
  id: string,
  amount: number
): Promise<Goal> => {
  const response = await api.put(`/goals/${id}`, { amount });
  return response.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  await api.delete(`/goals/${id}`);
};
