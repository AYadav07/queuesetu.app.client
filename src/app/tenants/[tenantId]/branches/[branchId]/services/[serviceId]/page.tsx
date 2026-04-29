import type { Metadata } from "next";
import ServiceDetailClient from "./ServiceDetailClient";

export const metadata: Metadata = {
  title: "Service — QueueSetu",
};

type Props = {
  params: Promise<{ tenantId: string; branchId: string; serviceId: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { tenantId, branchId, serviceId } = await params;
  return (
    <ServiceDetailClient
      tenantId={tenantId}
      branchId={branchId}
      serviceId={serviceId}
    />
  );
}
