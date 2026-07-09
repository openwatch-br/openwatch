"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDossieBook } from "./DossieBookContext";

/**
 * Book-wide pager for the dossiê: keyboard ←/→ navigation plus a slim,
 * centered bottom control that steps through the derived page sequence
 * (overview → chapters → signals). Logic is unchanged from the original
 * book-shell concept; only the presentation is Nexo-aligned.
 */
export function DossieBookNav() {
  const router = useRouter();
  const { pages, currentIndex } = useDossieBook();

  const totalPages = pages.length;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < totalPages - 1;
  const currentPage = pages[currentIndex];

  const goPrev = useCallback(() => {
    const prev = pages[currentIndex - 1];
    if (hasPrev && prev) router.push(prev.href);
  }, [hasPrev, pages, currentIndex, router]);

  const goNext = useCallback(() => {
    const next = pages[currentIndex + 1];
    if (hasNext && next) router.push(next.href);
  }, [hasNext, pages, currentIndex, router]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  if (totalPages <= 1 || currentIndex < 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface-card/90 py-1.5 pl-1.5 pr-2 shadow-lg backdrop-blur">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          aria-label="Página anterior"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            hasPrev ? "text-primary hover:bg-surface-subtle" : "cursor-not-allowed text-muted opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="hidden max-w-[220px] truncate text-xs text-secondary sm:block">
          {currentPage?.label}
        </span>
        <span
          className="rounded-full bg-surface-subtle px-2.5 py-0.5 font-mono text-[10px] tabular-nums text-muted"
        >
          {currentIndex + 1} / {totalPages}
        </span>

        <button
          onClick={goNext}
          disabled={!hasNext}
          aria-label="Próxima página"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            hasNext ? "text-primary hover:bg-surface-subtle" : "cursor-not-allowed text-muted opacity-40",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
