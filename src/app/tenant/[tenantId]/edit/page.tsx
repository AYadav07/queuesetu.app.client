import type { Metadata } from "next";
import TenantFormClient from "@/app/tenants/new/TenantFormClient";

export const metadata: Metadata = {
  title: "Edit Organisation — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function EditTenantPage({ params }: Props) {
  const { tenantId } = await params;
  return <TenantFormClient tenantId={tenantId} />;
}
