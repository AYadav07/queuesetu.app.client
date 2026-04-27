import type { Metadata } from "next";
import BranchFormClient from "./BranchFormClient";

export const metadata: Metadata = {
  title: "Add Branch — QueueSetu",
};

type Props = { params: Promise<{ tenantId: string }> };

export default async function NewBranchPage({ params }: Props) {
  const { tenantId } = await params;
  return <BranchFormClient tenantId={tenantId} />;
}
