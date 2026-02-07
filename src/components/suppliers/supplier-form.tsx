"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { createSupplier, updateSupplier } from "@/actions/supplier-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SupplierFormProps {
  supplier?: {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    materialType: string | null;
    certifications: string | null;
  };
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEditing = !!supplier;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateSupplier(supplier!.id, formData)
        : await createSupplier(formData);

      if ("error" in result && result.error) {
        setErrors(result.error as Record<string, string[]>);
        toast.error("Please fix the errors below.");
        return;
      }

      toast.success(
        isEditing ? "Supplier updated successfully." : "Supplier created successfully."
      );
      router.push("/suppliers");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Supplier" : "New Supplier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={supplier?.name ?? ""}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={supplier?.contactName ?? ""}
              />
              {errors.contactName && (
                <p className="text-sm text-red-500">{errors.contactName[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={supplier?.contactEmail ?? ""}
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-500">{errors.contactEmail[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                defaultValue={supplier?.contactPhone ?? ""}
              />
              {errors.contactPhone && (
                <p className="text-sm text-red-500">{errors.contactPhone[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Input
                id="materialType"
                name="materialType"
                placeholder="e.g. Buffalo, Chicken, Pork"
                defaultValue={supplier?.materialType ?? ""}
              />
              {errors.materialType && (
                <p className="text-sm text-red-500">{errors.materialType[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              name="certifications"
              placeholder="e.g. FSSAI, HACCP, ISO 22000"
              defaultValue={supplier?.certifications ?? ""}
              rows={3}
            />
            {errors.certifications && (
              <p className="text-sm text-red-500">{errors.certifications[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Supplier" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
