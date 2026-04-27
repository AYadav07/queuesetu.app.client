import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — QueueSetu",
  description: "Manage your QueueSetu account",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
