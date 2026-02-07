import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { OcrStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  OcrStatus,
  { label: string; color: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700",
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-100 text-red-700",
  },
};

interface OcrStatusIndicatorProps {
  status: OcrStatus;
  confidenceAvg?: number | null;
}

export function OcrStatusIndicator({
  status,
  confidenceAvg,
}: OcrStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant="outline" className={config.color}>
        {status === "PROCESSING" && (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        )}
        {config.label}
      </Badge>
      {status === "COMPLETED" && confidenceAvg != null && (
        <span className="text-xs text-gray-500">
          {Math.round(confidenceAvg * 100)}% confidence
        </span>
      )}
    </span>
  );
}
