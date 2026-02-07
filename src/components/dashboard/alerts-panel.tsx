"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlertRow {
  id: string;
  type: string;
  severity: "WARNING" | "CRITICAL";
  message: string;
  createdAt: string;
  batch: { batchCode: string };
}

interface AlertsPanelProps {
  alerts: AlertRow[];
}

const severityConfig = {
  WARNING: {
    icon: AlertTriangle,
    badgeClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    borderClass: "border-l-yellow-500",
  },
  CRITICAL: {
    icon: AlertOctagon,
    badgeClass: "bg-red-100 text-red-800 hover:bg-red-100",
    borderClass: "border-l-red-500",
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unacknowledged Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No unacknowledged alerts.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-md border border-l-4 ${config.borderClass} p-3`}
                >
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={config.badgeClass}
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.batch.batchCode}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
