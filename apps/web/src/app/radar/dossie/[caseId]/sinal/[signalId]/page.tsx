import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/SinalPage";

export function generateStaticParams() {
  return [{ caseId: "placeholder", signalId: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
