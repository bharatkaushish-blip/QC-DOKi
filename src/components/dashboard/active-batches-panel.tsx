"use client";

import Link from "next/link";
import { format } from "date-fns";
import { BatchStatus } from "@prisma/client";
import { BatchStatusBadge } from "@/components/batches/batch-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BatchRow {
  id: string;
  batchCode: string;
  status: BatchStatus;
  product: { name: string };
  flavour: { name: string };
  createdAt: string;
}

interface ActiveBatchesPanelProps {
  batches: BatchRow[];
}

export function ActiveBatchesPanel({ batches }: ActiveBatchesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Batches</CardTitle>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No batches found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Flavour</TableHead>
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
                    <BatchStatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(batch.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
