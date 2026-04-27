import type { Metadata } from "next";
import TenantFormClient from "../../new/TenantFormClient";

export const metadata: Metadata = {
  title: "Edit Organisation — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function EditTenantPage({ params }: Props) {
  const { tenantId } = await params;
  // Initial values will be loaded client-side via the auth store + API
  return <TenantFormClient tenantId={tenantId} />;
}
