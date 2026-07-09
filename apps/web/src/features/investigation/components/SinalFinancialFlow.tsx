"use client";

export interface FlowNode {
  name: string;
  role: string;
  token: string;
  flag?: string;
}

interface SinalFinancialFlowProps {
  source: FlowNode;
  target: FlowNode;
  amountLabel: string;
  contractLabel?: string;
}

/** Origin → destination money-flow diagram (not a table), per the laudo. */
export function SinalFinancialFlow({
  source,
  target,
  amountLabel,
  contractLabel,
}: SinalFinancialFlowProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-subtle px-6 py-5">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Fluxo financeiro
      </p>
      <div className="flex items-center gap-0">
        <FlowEndpoint node={source} />
        <div className="flex flex-[1.4] flex-col items-center gap-1 px-1.5">
          <span className="font-mono text-[13px] font-semibold text-primary">{amountLabel}</span>
          <div
            className="h-2 w-full rounded-full opacity-75"
            style={{
              background: `linear-gradient(90deg, ${source.token}, ${target.token})`,
            }}
          />
          {contractLabel && (
            <span className="font-mono text-[10px] text-muted">{contractLabel}</span>
          )}
        </div>
        <FlowEndpoint node={target} />
      </div>
    </div>
  );
}

function FlowEndpoint({ node }: { node: FlowNode }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
      <span className="h-3 w-3 rounded-full" style={{ background: node.token }} />
      <span className="text-[12.5px] font-semibold text-primary">{node.name}</span>
      <span
        className="font-mono text-[10.5px]"
        style={{ color: node.flag ? "var(--color-critical)" : "var(--color-text-3)" }}
      >
        {node.flag ?? node.role}
      </span>
    </div>
  );
}
