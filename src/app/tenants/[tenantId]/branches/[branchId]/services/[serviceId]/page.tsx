import type { Metadata } from "next";
import ServiceDetailClient from "./ServiceDetailClient";

export const metadata: Metadata = {
  title: "Service — QueueSetu",
};

type Props = {
  params: Promise<{ serviceId: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { serviceId } = await params;
  return <ServiceDetailClient serviceId={serviceId} />;
}
