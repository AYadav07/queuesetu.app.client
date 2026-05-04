import type { Metadata } from "next";
import SlotQueueClient from "@/app/tenants/[tenantId]/branches/[branchId]/services/[serviceId]/slots/[slotId]/SlotQueueClient";

export const metadata: Metadata = {
  title: "Slot — QueueSetu",
};

type Props = { params: Promise<{ slotId: string }> };

export default async function SlotFlatPage({ params }: Props) {
  const { slotId } = await params;
  return <SlotQueueClient slotId={slotId} />;
}
