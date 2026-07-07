import { ChevronDown, Heart, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { isNavGroup, NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { iniciales } from "@/lib/edad";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  ENFERMERA: "Enfermera(o)",
  MEDICO: "Médico",
  OBSTETRA: "Obstetra",
  SUPERVISOR: "Supervisor",
  SISTEMA: "Sistema",
};

const itemClasses = (isActive: boolean, collapsed: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
    isActive && "bg-active text-white hover:bg-active hover:text-white",
    collapsed && "justify-center px-0"
  );

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const programasGroup = NAV_ITEMS.find(isNavGroup);
  const programasActivo = programasGroup?.children.some((c) => c.to === location.pathname) ?? false;
  const [programasAbierto, setProgramasAbierto] = useState(programasActivo);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <Heart className="h-6 w-6 shrink-0 fill-active text-active" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">SIGAPS</p>
              <p className="truncate text-xs leading-tight text-sidebar-foreground/60">MINSA Perú</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 rounded-md p-1 text-sidebar-foreground/60 hover:bg-white/10 hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.filter((item) => isNavGroup(item) || !item.adminOnly || user?.rol === "ADMIN").map((item) => {
          if (isNavGroup(item)) {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setProgramasAbierto((v) => !v)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
                    programasActivo && !programasAbierto && "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition-transform", programasAbierto && "rotate-180")}
                      />
                    </>
                  )}
                </button>
                {!collapsed && programasAbierto && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => itemClasses(isActive, false)}
                      >
                        <child.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => itemClasses(isActive, collapsed)}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-3">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active text-sm font-semibold text-white">
              {iniciales(user.nombreCompleto)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ROL_LABELS[user.rol] ?? user.rol}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user.email ?? "Sin correo registrado"}</p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-white/10 hover:text-sidebar-foreground"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
