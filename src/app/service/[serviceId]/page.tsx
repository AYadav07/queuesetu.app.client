import type { Metadata } from "next";
import ServiceDetailClient from "@/app/tenants/[tenantId]/branches/[branchId]/services/[serviceId]/ServiceDetailClient";

export const metadata: Metadata = {
  title: "Service — QueueSetu",
};

type Props = { params: Promise<{ serviceId: string }> };

export default async function ServiceFlatPage({ params }: Props) {
  const { serviceId } = await params;
  return <ServiceDetailClient serviceId={serviceId} />;
}
