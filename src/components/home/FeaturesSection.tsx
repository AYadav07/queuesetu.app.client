import { BarChart3, BellRing, Clock3, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Live Queue Tracking",
    description:
      "Monitor queue status in real time and keep customers informed clearly.",
    icon: Clock3,
  },
  {
    title: "Real-Time Notifications",
    description:
      "Send timely updates so users know exactly when it is their turn.",
    icon: BellRing,
  },
  {
    title: "Analytics Dashboard",
    description:
      "Measure performance trends and improve operations with clear insights.",
    icon: BarChart3,
  },
];

export default function FeaturesSection() {
  return (
    <section className="mt-8" aria-label="Features">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
