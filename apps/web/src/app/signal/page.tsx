import ClientPage from "@/features/signal/components/SignalIndexPage";

/**
 * Índice de sinais — lista paginada com filtros (tipologia, severidade,
 * UF, período). Passo 1 do fluxo sinal → detalhe → grafo → drawer.
 */
export default function Page() {
  return (
    <div className="ow-mode-working ow-content">
      <ClientPage />
    </div>
  );
}
