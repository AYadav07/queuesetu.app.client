import type { Metadata } from "next";
import QueueDetailClient from "./QueueDetailClient";

export const metadata: Metadata = {
  title: "Queue — QueueSetu",
};

type Props = {
  params: Promise<{ queueId: string }>;
};

export default async function QueueDetailPage({ params }: Props) {
  const { queueId } = await params;
  return <QueueDetailClient queueId={queueId} />;
}
