import type { Metadata } from "next";
import BranchDetailClient from "./BranchDetailClient";

export const metadata: Metadata = {
  title: "Branch — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string; branchId: string }> };

export default async function BranchDetailPage({ params }: Props) {
  const { tenantId, branchId } = await params;
  return <BranchDetailClient tenantId={tenantId} branchId={branchId} />;
}
