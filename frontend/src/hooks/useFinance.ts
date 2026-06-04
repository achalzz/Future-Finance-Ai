import { useEffect, useState } from "react";
import { getDashboardData } from "../services/finance.service";

export const useFinance = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  return { data };
};
