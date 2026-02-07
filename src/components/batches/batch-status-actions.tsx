"use client";

import { useTransition } from "react";
import { updateBatchStatus } from "@/actions/batch-actions";
import { Button } from "@/components/ui/button";
import { BatchStatus } from "@prisma/client";
import { toast } from "sonner";
import { Play, CheckCircle, Package, Truck, Loader2 } from "lucide-react";

const transitions: Partial<
  Record<BatchStatus, { next: BatchStatus; label: string; icon: React.ElementType }[]>
> = {
  CREATED: [{ next: "IN_PROGRESS", label: "Start Production", icon: Play }],
  IN_PROGRESS: [
    { next: "QC_PENDING", label: "Send to QC", icon: CheckCircle },
  ],
  QC_APPROVED: [{ next: "PACKAGED", label: "Mark Packaged", icon: Package }],
  PACKAGED: [{ next: "SHIPPED", label: "Mark Shipped", icon: Truck }],
};

export function BatchStatusActions({
  batchId,
  currentStatus,
}: {
  batchId: string;
  currentStatus: BatchStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const available = transitions[currentStatus] ?? [];

  if (available.length === 0) return null;

  function handleTransition(nextStatus: BatchStatus) {
    startTransition(async () => {
      const result = await updateBatchStatus(batchId, nextStatus);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success(`Batch status updated.`);
    });
  }

  return (
    <div className="flex gap-2">
      {available.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.next}
            onClick={() => handleTransition(t.next)}
            disabled={isPending}
            size="sm"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon className="mr-2 h-4 w-4" />
            )}
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
