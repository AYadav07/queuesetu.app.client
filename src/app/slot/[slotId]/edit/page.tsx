import type { Metadata } from "next";
import SlotFormClient from "@/components/forms/SlotFormClient";

export const metadata: Metadata = {
  title: "Edit Slot — QueueSetu",
};

type Props = { params: Promise<{ slotId: string }> };

export default async function EditSlotPage({ params }: Props) {
  const { slotId } = await params;
  return <SlotFormClient mode="edit" slotId={slotId} />;
}
