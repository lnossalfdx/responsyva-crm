import { NavLink } from "react-router-dom";
import { Bot, BriefcaseBusiness, CalendarDays, Building2, HandCoins, LayoutDashboard, Settings2, Sparkles, Workflow } from "lucide-react";
import { navItems } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import { canAccessFinance, canAccessSettings, loadCurrentUser } from "@/services/access-control";

const icons = {
  "/": LayoutDashboard,
  "/leads": Sparkles,
  "/agendamentos": CalendarDays,
  "/clientes": Building2,
  "/pipeline": Workflow,
  "/projetos": BriefcaseBusiness,
  "/financeiro": HandCoins,
  "/automacoes": Bot,
  "/ia": Bot,
  "/configuracoes": Settings2,
} as const;

export function Sidebar() {
  const currentUser = loadCurrentUser();
  const visibleNavItems = navItems.filter((item) => {
    if (item.path === "/financeiro") {
      return canAccessFinance(currentUser);
    }

    if (item.path === "/configuracoes") {
      return canAccessSettings(currentUser);
    }

    return true;
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-[288px] shrink-0 border-r border-white/10 bg-black/25 px-5 py-6 backdrop-blur-2xl xl:block">
      <div className="mb-8 flex items-center justify-center px-4 py-2">
        <img
          src="/logo.png"
          alt="Responsyva"
          className="h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(52,211,153,0.16)]"
        />
      </div>

      <nav className="space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = icons[item.path as keyof typeof icons];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm text-zinc-400 transition-all",
                  isActive
                    ? "border-emerald-400/25 bg-emerald-400/10 text-white shadow-[0_0_24px_rgba(52,211,153,0.12)]"
                    : "border-transparent hover:border-white/10 hover:bg-white/5 hover:text-zinc-100",
                )
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-violet-200">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
