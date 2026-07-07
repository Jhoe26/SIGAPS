import { Bell, ChevronRight, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

import { encontrarMetaDePagina } from "@/lib/navigation";
import { iniciales } from "@/lib/edad";
import { useAuthStore } from "@/stores/authStore";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return null;
  }

  const meta = encontrarMetaDePagina(location.pathname);
  const title = meta?.title ?? "SIGAPS";
  const breadcrumb = meta?.breadcrumb ?? [];

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {breadcrumb.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((segmento, i) => (
              <span key={segmento} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {segmento}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar..."
            className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-14 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-input bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active text-xs font-semibold text-white">
            {iniciales(user.nombreCompleto)}
          </div>
          <div className="hidden min-w-0 text-sm leading-tight sm:block">
            <p className="truncate font-medium text-foreground">{user.nombreCompleto}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.centro?.nombre ?? "Sin centro asignado"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
