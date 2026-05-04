import type { Metadata } from "next";
import ServiceFormClient from "@/components/forms/ServiceFormClient";

export const metadata: Metadata = {
  title: "Edit Service — QueueSetu",
};

type Props = { params: Promise<{ serviceId: string }> };

export default async function EditServicePage({ params }: Props) {
  const { serviceId } = await params;
  return <ServiceFormClient mode="edit" serviceId={serviceId} />;
}
