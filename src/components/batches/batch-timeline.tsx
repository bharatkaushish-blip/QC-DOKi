import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Shield } from "lucide-react";
import { DownloadFormButton } from "@/components/forms/download-form-button";

interface StageRecord {
  id: string;
  startedAt: Date | null;
  completedAt: Date | null;
  committedAt: Date | null;
  ocrStatus: string;
  stage: {
    name: string;
    order: number;
    isQcGate: boolean;
  };
  measurements: { id: string }[];
  qcApproval: { id: string; result: string } | null;
}

function getStageStatus(record: StageRecord) {
  if (record.committedAt) return "completed";
  if (record.startedAt) return "in_progress";
  return "not_started";
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Completed",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "In Progress",
  },
  not_started: {
    icon: Circle,
    color: "text-gray-400",
    bg: "bg-gray-100",
    label: "Not Started",
  },
};

export function BatchTimeline({
  stageRecords,
  batchId,
}: {
  stageRecords: StageRecord[];
  batchId: string;
}) {
  const sorted = [...stageRecords].sort(
    (a, b) => a.stage.order - b.stage.order
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {sorted.map((record) => {
          const status = getStageStatus(record);
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div key={record.id} className="relative flex items-start gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${config.bg}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {record.stage.order}. {record.stage.name}
                  </span>
                  {record.stage.isQcGate && (
                    <Badge variant="destructive" className="text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      QC Gate
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <DownloadFormButton
                    batchId={batchId}
                    stageIndex={record.stage.order - 1}
                    label="PDF"
                  />
                </div>

                {record.measurements.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {record.measurements.length} measurement(s) recorded
                  </p>
                )}

                {record.qcApproval && (
                  <p className="text-xs mt-1">
                    <span className="font-medium">QC: </span>
                    <Badge
                      variant={
                        record.qcApproval.result === "APPROVED"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {record.qcApproval.result}
                    </Badge>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
