import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;
