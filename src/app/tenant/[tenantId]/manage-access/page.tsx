import type { Metadata } from "next";
import ManageAccessClient from "@/components/roles/ManageAccessClient";

export const metadata: Metadata = {
  title: "Manage Access — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function TenantManageAccessPage({ params }: Props) {
  const { tenantId } = await params;
  return (
    <ManageAccessClient
      scopeType="TENANT"
      scopeId={tenantId}
      backHref={`/tenant/${tenantId}`}
      availableRoles={[{ value: "TENANT_ADMIN", label: "Tenant Admin" }]}
    />
  );
}
