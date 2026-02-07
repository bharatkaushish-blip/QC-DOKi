import { Badge } from "@/components/ui/badge";
import { BATCH_STATUSES } from "@/lib/constants";
import { BatchStatus } from "@prisma/client";

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const config = BATCH_STATUSES[status];
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
}
