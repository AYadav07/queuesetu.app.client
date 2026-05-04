import type { Metadata } from "next";
import TenantDetailClient from "@/app/tenants/[tenantId]/TenantDetailClient";

export const metadata: Metadata = {
  title: "Tenant — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function TenantFlatPage({ params }: Props) {
  const { tenantId } = await params;
  return <TenantDetailClient tenantId={tenantId} />;
}
