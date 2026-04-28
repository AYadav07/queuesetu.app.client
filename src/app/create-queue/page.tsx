import type { Metadata } from "next";
import CreateQueueClient from "./CreateQueueClient";

export const metadata: Metadata = {
  title: "Create Queue — QueueSetu",
  description: "Set up a new managed queue for your branch",
};

export default function CreateQueuePage() {
  return <CreateQueueClient />;
}
