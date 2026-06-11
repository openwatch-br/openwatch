import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/SignalFlowPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return <Suspense><ClientPage /></Suspense>;
}
