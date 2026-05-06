import type { Metadata } from "next";
import ManageAccessClient from "@/components/roles/ManageAccessClient";

export const metadata: Metadata = {
  title: "Manage Access — QueueSetu",
};

type Props = { params: Promise<{ branchId: string }> };

export default async function BranchManageAccessPage({ params }: Props) {
  const { branchId } = await params;
  return (
    <ManageAccessClient
      scopeType="BRANCH"
      scopeId={branchId}
      backHref={`/branch/${branchId}`}
      availableRoles={[{ value: "BRANCH_ADMIN", label: "Branch Admin" }]}
    />
  );
}
