import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function Layout() {
  return (
    <div className="flex h-screen print:block print:h-auto">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col print:block">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-app p-6 print:overflow-visible print:bg-white print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
