"use client";

import { useTransition } from "react";
import { toggleFlavourActive } from "@/actions/product-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Flavour {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export function FlavourList({ flavours }: { flavours: Flavour[] }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleFlavourActive(id);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success(active ? "Flavour archived." : "Flavour restored.");
    });
  }

  if (flavours.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No flavours configured yet. Add one above.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flavours.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-medium">{f.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{f.code}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={f.active ? "default" : "secondary"}>
                {f.active ? "Active" : "Archived"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleToggle(f.id, f.active)}
                disabled={isPending}
              >
                {f.active ? (
                  <Archive className="h-4 w-4" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
