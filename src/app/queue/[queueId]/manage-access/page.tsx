import type { Metadata } from "next";
import ManageAccessClient from "@/components/roles/ManageAccessClient";

export const metadata: Metadata = {
  title: "Manage Access — QueueSetu",
};

type Props = { params: Promise<{ queueId: string }> };

export default async function QueueManageAccessPage({ params }: Props) {
  const { queueId } = await params;
  return (
    <ManageAccessClient
      scopeType="QUEUE"
      scopeId={queueId}
      backHref={`/queue/${queueId}`}
      availableRoles={[{ value: "STAFF", label: "Staff" }]}
    />
  );
}
