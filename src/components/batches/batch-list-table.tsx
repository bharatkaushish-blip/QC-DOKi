"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchStatusBadge } from "./batch-status-badge";
import { format } from "date-fns";
import { BatchStatus } from "@prisma/client";

interface BatchRow {
  id: string;
  batchCode: string;
  status: BatchStatus;
  createdAt: Date;
  product: { name: string; code: string };
  flavour: { name: string; code: string };
  supplier: { name: string } | null;
  createdBy: { name: string };
  _count: { stageRecords: number };
}

export function BatchListTable({ batches }: { batches: BatchRow[] }) {
  return (
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
              <TableCell>{batch.flavour.name}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
