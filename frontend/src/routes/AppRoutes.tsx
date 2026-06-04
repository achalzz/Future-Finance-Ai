import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Chatbot from "../pages/Chatbot";
import ExpenseTracker from "../pages/ExpenseTracker";
import BudgetPlanner from "../pages/BudgetPlanner";
import Goals from "../pages/Goals";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.CHAT} element={<Chatbot />} />
              <Route path={ROUTES.BUDGET} element={<BudgetPlanner />} />
              <Route path={ROUTES.EXPENSES} element={<ExpenseTracker />} />
              <Route path={ROUTES.GOALS} element={<Goals />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;