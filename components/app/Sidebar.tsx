"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Plus,
  Building2,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProject {
  id: string;
  productName: string;
  status: string;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new", label: "Novo projeto", icon: Plus },
  { href: "/profile", label: "Perfil da empresa", icon: Building2 },
];

export function Sidebar({
  projects,
  userEmail,
}: {
  projects: SidebarProject[];
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const body = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span>
            Digistore <span className="text-indigo-600">Forge</span>
          </span>
        </Link>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Projetos recentes
        </div>
        {projects.length === 0 ? (
          <p className="px-3 text-xs text-slate-400">Nenhum projeto ainda.</p>
        ) : (
          <ul className="space-y-0.5">
            {projects.map((p) => {
              const active = pathname === `/project/${p.id}`;
              return (
                <li key={p.id}>
                  <Link
                    href={`/project/${p.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition",
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{p.productName}</span>
                    <StatusPill status={p.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t px-6 py-4">
        <p className="text-xs text-slate-500 truncate mb-2">{userEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-40 rounded-md bg-white border p-2 shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "md:w-64 md:block md:border-r md:bg-white md:sticky md:top-0 md:h-screen",
          open
            ? "fixed inset-0 z-30 bg-white"
            : "hidden"
        )}
      >
        {body}
      </aside>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "deployed")
    return (
      <Badge variant="default" className="bg-emerald-600 text-white">
        live
      </Badge>
    );
  if (status === "generated")
    return (
      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
        gerado
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-slate-500">
      draft
    </Badge>
  );
}
