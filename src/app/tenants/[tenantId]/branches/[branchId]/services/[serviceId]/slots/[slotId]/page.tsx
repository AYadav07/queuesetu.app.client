import type { Metadata } from "next";
import SlotQueueClient from "./SlotQueueClient";

export const metadata: Metadata = {
  title: "Slot Queue — QueueSetu",
};

type Props = {
  params: Promise<{
    tenantId: string;
    branchId: string;
    serviceId: string;
    slotId: string;
  }>;
};

export default async function SlotQueuePage({ params }: Props) {
  const { tenantId, branchId, serviceId, slotId } = await params;
  return (
    <SlotQueueClient
      tenantId={tenantId}
      branchId={branchId}
      serviceId={serviceId}
      slotId={slotId}
    />
  );
}
