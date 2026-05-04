import type { Metadata } from "next";
import SlotQueueClient from "./SlotQueueClient";

export const metadata: Metadata = {
  title: "Slot Queue — QueueSetu",
};

type Props = {
  params: Promise<{
    slotId: string;
  }>;
};

export default async function SlotQueuePage({ params }: Props) {
  const { slotId } = await params;
  return <SlotQueueClient slotId={slotId} />;
}
