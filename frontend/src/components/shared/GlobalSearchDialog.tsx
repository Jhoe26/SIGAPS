import { useEffect, useState } from "react";
import { LayoutDashboard, Syringe, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCESOS_RAPIDOS = [
  { label: "Todos los pacientes", to: "/pacientes", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, color: "bg-slate-100 text-slate-600" },
  { label: "Control CRED", to: "/programas/cred", icon: Target, color: "bg-purple-50 text-purple-600" },
  { label: "Vacunación PAI", to: "/programas/pai", icon: Syringe, color: "bg-green-50 text-green-600" },
];

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const buscar = () => {
    if (!query.trim()) {
      return;
    }
    navigate(`/pacientes?search=${encodeURIComponent(query.trim())}`);
    onOpenChange(false);
  };

  const ir = (to: string) => {
    navigate(to);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <div className="border-b border-border p-3">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar pacientes, profesionales, programas..."
            className="h-12 border-0 px-2 text-base shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accesos rápidos</p>
          <div className="grid grid-cols-2 gap-2">
            {ACCESOS_RAPIDOS.map(({ label, to, icon: Icon, color }) => (
              <button
                key={label}
                type="button"
                onClick={() => ir(to)}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium text-foreground transition-colors hover:border-active hover:bg-active/5"
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
