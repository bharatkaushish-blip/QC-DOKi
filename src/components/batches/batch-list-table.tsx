"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatchStatusBadge } from "./batch-status-badge";
import { deleteBatch } from "@/actions/batch-actions";
import { format } from "date-fns";
import { BatchStatus } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BatchRow {
  id: string;
  batchCode: string;
  status: BatchStatus;
  createdAt: Date;
  product: { name: string; code: string };
  flavour: { name: string; code: string } | null;
  supplier: { name: string } | null;
  createdBy: { name: string };
  _count: { stageRecords: number };
}

export function BatchListTable({ batches }: { batches: BatchRow[] }) {
  const [deleteTarget, setDeleteTarget] = useState<BatchRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteBatch(deleteTarget.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Batch ${deleteTarget.batchCode} deleted`);
      }
      setDeleteTarget(null);
    });
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Flavour</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <Link
                    href={`/batches/${batch.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {batch.batchCode}
                  </Link>
                </TableCell>
                <TableCell>{batch.product.name}</TableCell>
                <TableCell>
                  {batch.flavour ? (
                    batch.flavour.name
                  ) : (
                    <span className="text-amber-600 italic">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {batch.supplier?.name ?? (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <BatchStatusBadge status={batch.status} />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(batch.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                    onClick={() => setDeleteTarget(batch)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete batch{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.batchCode}
              </span>
              ? This will permanently remove all stage records, measurements, and
              QC approvals for this batch. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
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
