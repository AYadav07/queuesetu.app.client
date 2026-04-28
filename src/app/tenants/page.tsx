import type { Metadata } from "next";
import TenantsClient from "./TenantsClient";

export const metadata: Metadata = {
  title: "My Tenants — QueueSetu",
  description: "Manage your organisations and branches",
};

export default function TenantsPage() {
  return <TenantsClient />;
}
