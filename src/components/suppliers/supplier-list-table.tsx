"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleSupplierActive } from "@/actions/supplier-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  materialType: string | null;
  active: boolean;
}

export function SupplierListTable({ suppliers }: { suppliers: Supplier[] }) {
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      const result = await toggleSupplierActive(id);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success(
        currentlyActive ? "Supplier archived." : "Supplier restored."
      );
    });
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Material Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {supplier.contactName && (
                    <div>{supplier.contactName}</div>
                  )}
                  {supplier.contactEmail && (
                    <div className="text-gray-500">{supplier.contactEmail}</div>
                  )}
                  {supplier.contactPhone && (
                    <div className="text-gray-500">{supplier.contactPhone}</div>
                  )}
                  {!supplier.contactName &&
                    !supplier.contactEmail &&
                    !supplier.contactPhone && (
                      <span className="text-gray-400">—</span>
                    )}
                </div>
              </TableCell>
              <TableCell>
                {supplier.materialType || (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={supplier.active ? "default" : "secondary"}>
                  {supplier.active ? "Active" : "Archived"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleActive(supplier.id, supplier.active)
                      }
                      disabled={isPending}
                    >
                      {supplier.active ? (
                        <>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
