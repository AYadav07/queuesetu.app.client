import type { Metadata } from "next";
import SlotFormClient from "@/components/forms/SlotFormClient";

export const metadata: Metadata = {
  title: "Add Slot — QueueSetu",
};

type Props = { params: Promise<{ serviceId: string }> };

export default async function AddNewSlotPage({ params }: Props) {
  const { serviceId } = await params;
  return <SlotFormClient mode="create" serviceId={serviceId} />;
}
