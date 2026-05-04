import type { Metadata } from "next";
import ServiceFormClient from "@/components/forms/ServiceFormClient";

export const metadata: Metadata = {
  title: "Add Service — QueueSetu",
};

type Props = { params: Promise<{ branchId: string }> };

export default async function AddNewServicePage({ params }: Props) {
  const { branchId } = await params;
  return <ServiceFormClient mode="create" branchId={branchId} />;
}
