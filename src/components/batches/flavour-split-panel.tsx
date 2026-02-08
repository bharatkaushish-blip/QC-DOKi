"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  addFlavourSplit,
  deleteFlavourSplit,
} from "@/actions/flavour-split-actions";

interface FlavourOption {
  id: string;
  name: string;
  code: string;
}

interface FlavourSplit {
  id: string;
  packCount: number;
  notes: string | null;
  flavour: { id: string; name: string; code: string };
}

interface FlavourSplitPanelProps {
  batchId: string;
  splits: FlavourSplit[];
  availableFlavours: FlavourOption[];
}

export function FlavourSplitPanel({
  batchId,
  splits,
  availableFlavours,
}: FlavourSplitPanelProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFlavourId, setSelectedFlavourId] = useState("");
  const [packCount, setPackCount] = useState("");
  const [notes, setNotes] = useState("");

  const totalPacks = splits.reduce((sum, s) => sum + s.packCount, 0);

  function handleAdd() {
    if (!selectedFlavourId || !packCount) {
      toast.error("Please select a flavour and enter pack count.");
      return;
    }

    startTransition(async () => {
      const result = await addFlavourSplit(batchId, {
        flavourId: selectedFlavourId,
        packCount: parseInt(packCount, 10),
        notes: notes || undefined,
      });

      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : "Please fix the errors.";
        toast.error(errorMsg);
        return;
      }

      toast.success("Flavour split added.");
      setOpen(false);
      setSelectedFlavourId("");
      setPackCount("");
      setNotes("");
    });
  }

  function handleDelete(splitId: string) {
    startTransition(async () => {
      const result = await deleteFlavourSplit(splitId);
      if ("error" in result) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete.");
        return;
      }
      toast.success("Flavour split removed.");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Flavour Splits
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Split
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Flavour Split</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Flavour *</Label>
                <Select
                  value={selectedFlavourId}
                  onValueChange={setSelectedFlavourId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flavour" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFlavours.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pack Count *</Label>
                <Input
                  type="number"
                  min="1"
                  value={packCount}
                  onChange={(e) => setPackCount(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Split
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {splits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No flavour splits yet. Add a split to track flavour production.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flavour</TableHead>
                <TableHead className="text-right">Packs</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {splits.map((split) => (
                <TableRow key={split.id}>
                  <TableCell className="font-medium">
                    {split.flavour.name}{" "}
                    <span className="text-gray-400">({split.flavour.code})</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {split.packCount}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {split.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(split.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono">
                  {totalPacks}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
