import type { Metadata } from "next";
import TenantDetailClient from "./TenantDetailClient";

export const metadata: Metadata = {
  title: "Tenant — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function TenantDetailPage({ params }: Props) {
  const { tenantId } = await params;
  return <TenantDetailClient tenantId={tenantId} />;
}
