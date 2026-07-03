"use client";

import { FlaskConical, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/frontend/components/shared/theme-toggle";
import { cn } from "@/frontend/utils/cn";

const navigation = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

const themeLabels = {
  loadingLabel: "Loading color theme",
  lightLabel: "Switch to light mode",
  darkLabel: "Switch to dark mode",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-background md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="relative z-20 border-b bg-[#17231f] text-stone-100 md:sticky md:top-0 md:h-svh md:border-b-0 md:border-r md:border-white/10">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:pb-7 md:pt-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg border border-emerald-200/20 bg-emerald-200/10 text-emerald-200 transition-transform group-hover:-rotate-3">
                <FlaskConical className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-serif text-lg leading-none tracking-tight">
                  Eval Studio
                </span>
                <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.22em] text-emerald-100/50">
                  Local workspace
                </span>
              </span>
            </Link>
            <div className="md:hidden">
              <ThemeToggle {...themeLabels} />
            </div>
          </div>

          <nav aria-label="Primary" className="overflow-x-auto px-3 pb-3 md:px-4">
            <ul className="flex gap-1 md:flex-col" role="list">
              {navigation.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-emerald-100/12 text-emerald-50 shadow-[inset_2px_0_0_#a7f3d0]"
                          : "text-stone-300 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto hidden p-4 md:block">
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-stone-500">
                v0.1
              </span>
              <ThemeToggle {...themeLabels} />
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
