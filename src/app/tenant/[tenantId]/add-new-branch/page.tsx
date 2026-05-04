import type { Metadata } from "next";
import BranchFormClient from "@/app/tenants/[tenantId]/branches/new/BranchFormClient";

export const metadata: Metadata = {
  title: "Add Branch — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function AddNewBranchPage({ params }: Props) {
  const { tenantId } = await params;
  return <BranchFormClient mode="create" tenantId={tenantId} />;
}
