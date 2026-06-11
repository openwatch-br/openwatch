import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { TabNav } from "@/components/TabNav";
import { Topbar } from "@/components/Topbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette } from "@/components/CommandPalette";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistDisplay = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — OpenWatch",
    default: "OpenWatch — Inteligência Investigativa Cidadã",
  },
  description:
    "Plataforma pública e open-source de auditoria cidadã sobre dados do governo federal brasileiro. Sinais de risco, evidências e investigações baseadas em dados abertos.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  keywords: [
    "auditoria cidadã", "corrupção", "licitação", "governo federal",
    "dados abertos", "transparência", "Brasil", "PNCP", "ComprasGov",
  ],
  openGraph: {
    title: "OpenWatch — Inteligência Investigativa Cidadã",
    description: "Plataforma de auditoria cidadã sobre dados do governo federal brasileiro.",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${inter.variable} ${geistDisplay.variable} ${geistMono.variable}`}
      >
        {/* Skip-to-content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:inline-flex focus:items-center focus:gap-2 focus:rounded focus:bg-[var(--color-brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-text-inv)] focus:outline-none"
        >
          Ir para o conteúdo principal
        </a>

        <CommandPalette />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
            },
          }}
        />

        {/* Global topbar — all viewports */}
        <Topbar />

        {/* Tab-pill nav — hidden on mobile (drawer covers it) */}
        <div className="hidden sm:block fixed top-[var(--topbar-height)] left-0 right-0 z-40">
          <Suspense fallback={<div className="ow-tabnav" aria-hidden="true" />}>
            <TabNav />
          </Suspense>
        </div>

        <Providers>
          <div className="ow-page ow-page-shell">
            <main id="main-content" className="ow-main" tabIndex={-1}>
              {children}
              <SiteFooter />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
