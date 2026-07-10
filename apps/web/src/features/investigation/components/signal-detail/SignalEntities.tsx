"use client";

import Link from "next/link";
import { displayIdentifierValue } from "@/lib/utils";
import { ENTITY_TOKEN } from "./inference";
import type { SignalEntity } from "@/lib/types";

/** Involved entities as forensic subject cards linking to each entity page. */
export function SignalEntities({
  entities,
}: {
  entities: SignalEntity[];
}) {
  if (entities.length === 0) return null;

  return (
    <section>
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Entidades envolvidas · {entities.length}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
        {entities.map((ent) => {
          const token = ENTITY_TOKEN[ent.type] ?? "var(--color-entity-unknown)";
          const ids = Object.entries(ent.identifiers)
            .map(([k, v]) => [k, displayIdentifierValue(k, v)] as const)
            .filter((kv): kv is readonly [string, string] => kv[1] !== null)
            .slice(0, 2);
          return (
            <Link
              key={ent.id}
              href={`/entity/${ent.id}`}
              className="rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3 transition-colors hover:border-border"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: token }} />
                <span className="truncate text-[13px] font-semibold text-primary">{ent.name}</span>
                <span className="ml-auto font-mono text-[10px] uppercase text-muted">{ent.type}</span>
              </div>
              {ent.roles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {(ent.roles_detailed ?? ent.roles.map((r) => ({ code: r, label: r, count_in_signal: 1 })))
                    .slice(0, 4)
                    .map((r) => (
                      <span
                        key={r.code}
                        className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-secondary"
                      >
                        {r.label}
                        {r.count_in_signal > 1 && (
                          <span className="ml-1 text-brand-text">×{r.count_in_signal}</span>
                        )}
                      </span>
                    ))}
                </div>
              )}
              {ids.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {ids.map(([k, v]) => (
                    <span key={k} className="font-mono text-[10.5px] text-muted">
                      {k.toUpperCase()}: {v}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
