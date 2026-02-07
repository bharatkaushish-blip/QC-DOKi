"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity, PlayCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface TodaySummaryCardsProps {
  activeBatches: number;
  todayStarted: number;
  todayCompleted: number;
  totalAlerts: number;
}

const cards = [
  {
    key: "active" as const,
    label: "Active Batches",
    icon: Activity,
    colorClass: "text-blue-600 bg-blue-50",
    valueClass: "text-blue-700",
  },
  {
    key: "started" as const,
    label: "Started Today",
    icon: PlayCircle,
    colorClass: "text-green-600 bg-green-50",
    valueClass: "text-green-700",
  },
  {
    key: "completed" as const,
    label: "Completed Today",
    icon: CheckCircle2,
    colorClass: "text-purple-600 bg-purple-50",
    valueClass: "text-purple-700",
  },
  {
    key: "alerts" as const,
    label: "Active Alerts",
    icon: AlertTriangle,
    colorClass: "text-red-600 bg-red-50",
    valueClass: "text-red-700",
  },
];

export function TodaySummaryCards({
  activeBatches,
  todayStarted,
  todayCompleted,
  totalAlerts,
}: TodaySummaryCardsProps) {
  const values: Record<string, number> = {
    active: activeBatches,
    started: todayStarted,
    completed: todayCompleted,
    alerts: totalAlerts,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold ${card.valueClass}`}>
                    {values[card.key]}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${card.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
