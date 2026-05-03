import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home — QueueSetu",
  description: "Join a queue or create one for your business.",
};

export default function HomePage() {
  return <HomeClient />;
}
