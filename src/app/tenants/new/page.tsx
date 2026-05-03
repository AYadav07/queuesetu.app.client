import type { Metadata } from "next";
import TenantFormClient from "./TenantFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Organisation — QueueSetu",
  description: "Set up a new organisation on QueueSetu",
};

export default function NewTenantPage() {
  return <TenantFormClient />;
}
