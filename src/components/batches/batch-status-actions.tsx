"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBatchStatus, deleteBatch } from "@/actions/batch-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatchStatus } from "@prisma/client";
import { toast } from "sonner";
import { Play, CheckCircle, Package, Truck, Loader2, Trash2 } from "lucide-react";

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
  batchCode,
  currentStatus,
}: {
  batchId: string;
  batchCode: string;
  currentStatus: BatchStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const available = transitions[currentStatus] ?? [];

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

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBatch(batchId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Batch ${batchCode} deleted`);
        router.push("/batches");
      }
      setShowDeleteDialog(false);
    });
  }

  return (
    <>
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
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete batch{" "}
              <span className="font-semibold text-gray-900">{batchCode}</span>?
              This will permanently remove all stage records, measurements, and QC
              approvals. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
