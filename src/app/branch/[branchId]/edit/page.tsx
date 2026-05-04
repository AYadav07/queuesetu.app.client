import type { Metadata } from "next";
import BranchFormClient from "@/app/tenants/[tenantId]/branches/new/BranchFormClient";

export const metadata: Metadata = {
  title: "Edit Branch — QueueSetu",
};

type Props = { params: Promise<{ branchId: string }> };

export default async function EditBranchPage({ params }: Props) {
  const { branchId } = await params;
  return <BranchFormClient mode="edit" branchId={branchId} />;
}
