"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Clock,
  Home,
  Share2,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

type TabItem = {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  exact?: boolean;
};

// Nexo IA: Hoje · Radar · Rede · Cobertura · Metodologia (every rebrand
// mockup converges on this 5-item set). Compliance/API-health remain live
// routes, just not top-nav destinations in the new IA.
const GLOBAL_TABS: TabItem[] = [
  { href: "/", icon: Home, label: "Hoje", exact: true },
  { href: "/radar", icon: Zap, label: "Radar" },
  { href: "/radar/rede", icon: Share2, label: "Rede" },
  { href: "/coverage", icon: Activity, label: "Cobertura" },
  { href: "/methodology", icon: BookOpen, label: "Metodologia" },
];

function TabPill({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: TabItem["icon"];
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx("ow-tab-pill", active && "active")}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function TabNav() {
  const rawPathname = usePathname();
  // Normalize trailing slash so exact matches work with trailingSlash routing
  const pathname = rawPathname && rawPathname !== "/"
    ? rawPathname.replace(/\/+$/, "")
    : rawPathname;
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "";

  const dossierMatch = pathname?.match(/^\/radar\/dossie\/([^/]+)/);
  const caseId = dossierMatch?.[1];

  if (caseId) {
    const basePath = `/radar/dossie/${caseId}`;
    const dossierTabs = [
      { href: basePath, icon: Clock, label: "Cronologia", tab: null },
      { href: `${basePath}?tab=rede`, icon: Share2, label: "Rede", tab: "rede" },
    ];

    return (
      <nav className="ow-tabnav" aria-label="Navegação do dossiê">
        <Link href="/radar" className="ow-tab-pill ow-tab-pill-back">
          <ArrowLeft size={14} aria-hidden="true" />
          Radar
        </Link>
        {dossierTabs.map((item) => {
          const active = item.tab === null
            ? pathname === basePath && !currentTab
            : pathname === basePath && currentTab === item.tab;
          return (
            <TabPill
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={active}
            />
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="ow-tabnav" aria-label="Navegação principal">
      {GLOBAL_TABS.map((item) => {
        // "/radar" must not light up while on the nested "/radar/rede" tab.
        const active = item.exact
          ? pathname === item.href
          : item.href === "/radar"
            ? !!pathname?.startsWith("/radar") && !pathname.startsWith("/radar/rede")
            : !!pathname?.startsWith(item.href);
        return (
          <TabPill
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={active}
          />
        );
      })}
    </nav>
  );
}
