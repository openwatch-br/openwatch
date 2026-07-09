import { DossieBookProvider } from "@/features/dossie/components/DossieBookContext";
import { DossieBookNav } from "@/features/dossie/components/DossieBookNav";

export default async function DossieBookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <DossieBookProvider caseId={caseId}>
      {children}
      <DossieBookNav />
    </DossieBookProvider>
  );
}
