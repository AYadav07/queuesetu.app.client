import type { Metadata } from "next";
import ManageAccessClient from "@/components/roles/ManageAccessClient";

export const metadata: Metadata = {
  title: "Manage Access — QueueSetu",
};

type Props = { params: Promise<{ serviceId: string }> };

export default async function ServiceManageAccessPage({ params }: Props) {
  const { serviceId } = await params;
  return (
    <ManageAccessClient
      scopeType="SERVICE"
      scopeId={serviceId}
      backHref={`/service/${serviceId}`}
      availableRoles={[{ value: "SERVICE_MANAGER", label: "Service Manager" }]}
    />
  );
}
