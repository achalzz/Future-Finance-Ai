export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface Budget {
  income: number;
  savingsGoal: number;
  monthlyLimit: number;
}
