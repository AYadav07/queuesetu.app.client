import type { Metadata } from "next";
import BranchDetailClient from "@/app/tenants/[tenantId]/branches/[branchId]/BranchDetailClient";

export const metadata: Metadata = {
  title: "Branch — QueueSetu",
};

type Props = { params: Promise<{ branchId: string }> };

export default async function BranchFlatPage({ params }: Props) {
  const { branchId } = await params;
  return <BranchDetailClient branchId={branchId} />;
}
