import type { Metadata } from "next";
import JoinQueueClient from "./JoinQueueClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join a Queue — QueueSetu",
  description: "Browse and join active queues near you.",
};

export default function JoinQueuePage() {
  return <JoinQueueClient />;
}
