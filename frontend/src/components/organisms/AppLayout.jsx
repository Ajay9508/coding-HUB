import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

const AppLayout = ({ children, searchValue = "", onSearchChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FFFBF5]">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />

        <main className="flex-1 px-4 py-8 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
