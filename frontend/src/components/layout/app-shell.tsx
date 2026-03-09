import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AiFab } from "@/components/layout/ai-fab";
import { useCrmStore } from "@/stores/use-crm-store";

export function AppShell() {
  const loadLeads = useCrmStore((state) => state.loadLeads);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute right-[-5%] top-[15%] h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[28%] h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      </div>
      <div className="relative flex overflow-x-hidden">
        <Sidebar />
        <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden">
          <Topbar />
          <main className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <AiFab />
    </div>
  );
}
