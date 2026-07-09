import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/SignalDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <Suspense>
        <ClientPage />
      </Suspense>
    </div>
  );
}
