import {
  Activity,
  Baby,
  BarChart3,
  ClipboardList,
  Droplet,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Syringe,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLeaf {
  to: string;
  label: string;
  icon: LucideIcon;
  breadcrumb: string[];
  adminOnly?: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(item: NavEntry): item is NavGroup {
  return "children" in item;
}

/**
 * Fuente única de verdad para el Sidebar (qué mostrar) y el Topbar
 * (título + breadcrumb según la ruta activa), para que no se desincronicen.
 */
export const NAV_ITEMS: NavEntry[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, breadcrumb: ["Dashboard"] },
  { to: "/pacientes", label: "Pacientes", icon: Users, breadcrumb: ["Pacientes"] },
  {
    label: "Programas",
    icon: ClipboardList,
    children: [
      { to: "/programas/cred", label: "CRED", icon: HeartPulse, breadcrumb: ["Programas", "CRED"] },
      { to: "/programas/pai", label: "Vacunación (PAI)", icon: Syringe, breadcrumb: ["Programas", "Vacunación (PAI)"] },
      { to: "/programas/tamizaje", label: "Tamizaje", icon: Droplet, breadcrumb: ["Programas", "Tamizaje"] },
      { to: "/programas/anemia", label: "Anemia", icon: Activity, breadcrumb: ["Programas", "Anemia"] },
      { to: "/programas/gestacional", label: "Gestacional", icon: Baby, breadcrumb: ["Programas", "Gestacional"] },
    ],
  },
  { to: "/profesionales", label: "Profesionales", icon: Stethoscope, breadcrumb: ["Profesionales"] },
  { to: "/reportes", label: "Reportes", icon: BarChart3, breadcrumb: ["Reportes"] },
  { to: "/usuarios", label: "Usuarios", icon: UserCog, breadcrumb: ["Usuarios"], adminOnly: true },
  { to: "/configuracion", label: "Configuración", icon: Settings, breadcrumb: ["Configuración"], adminOnly: true },
];

function coincide(ruta: string, pathname: string): boolean {
  return pathname === ruta || pathname.startsWith(`${ruta}/`);
}

export function encontrarMetaDePagina(pathname: string): { title: string; breadcrumb: string[] } | null {
  for (const item of NAV_ITEMS) {
    if (!isNavGroup(item) && coincide(item.to, pathname)) {
      return { title: item.label, breadcrumb: item.breadcrumb };
    }
    if (isNavGroup(item)) {
      const hijo = item.children.find((child) => coincide(child.to, pathname));
      if (hijo) {
        return { title: hijo.label, breadcrumb: hijo.breadcrumb };
      }
    }
  }
  return null;
}
