"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { createBatch } from "@/actions/batch-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEFERRED_FLAVOUR_PRODUCT_CODES } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  code: string;
  flavours: { id: string; name: string; code: string }[];
}

interface Supplier {
  id: string;
  name: string;
}

export function BatchCreateForm({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedFlavourId, setSelectedFlavourId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableFlavours = selectedProduct?.flavours ?? [];
  const isFlavourOptional =
    selectedProduct &&
    DEFERRED_FLAVOUR_PRODUCT_CODES.includes(
      selectedProduct.code as (typeof DEFERRED_FLAVOUR_PRODUCT_CODES)[number]
    );

  // Reset flavour when product changes
  useEffect(() => {
    setSelectedFlavourId("");
  }, [selectedProductId]);

  async function handleSubmit(formData: FormData) {
    formData.set("productId", selectedProductId);
    formData.set("flavourId", selectedFlavourId);
    formData.set("supplierId", selectedSupplierId);

    startTransition(async () => {
      const result = await createBatch(formData);
      if ("error" in result) {
        setErrors(result.error as Record<string, string[]>);
        toast.error("Please fix the errors below.");
        return;
      }
      toast.success("Batch created successfully.");
      router.push(`/batches/${result.id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Production Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-500">{errors.productId[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Flavour {isFlavourOptional ? "(optional)" : "*"}
              </Label>
              <Select
                value={selectedFlavourId}
                onValueChange={setSelectedFlavourId}
                disabled={!selectedProductId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedProductId
                        ? isFlavourOptional
                          ? "Select flavour (optional)"
                          : "Select flavour"
                        : "Select product first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableFlavours.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFlavourOptional && (
                <p className="text-xs text-amber-600">
                  Flavour is applied during the Seasoning stage. You can assign it later.
                </p>
              )}
              {errors.flavourId && (
                <p className="text-sm text-red-500">{errors.flavourId[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierLot">Supplier Lot Number</Label>
              <Input
                id="supplierLot"
                name="supplierLot"
                placeholder="e.g. LOT-2024-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes for this batch..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/batches")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Batch
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
