"use client";

import { useTransition, useState } from "react";
import { createFlavour } from "@/actions/product-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export function FlavourForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createFlavour(productId, formData);
      if ("error" in result && result.error) {
        setErrors(result.error as Record<string, string[]>);
        toast.error("Please fix the errors below.");
        return;
      }
      setErrors({});
      toast.success("Flavour added.");
      // Reset the form
      const form = document.getElementById("flavour-form") as HTMLFormElement;
      form?.reset();
    });
  }

  return (
    <form id="flavour-form" action={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1">
        <Label htmlFor="flavour-name" className="text-xs">
          Name
        </Label>
        <Input
          id="flavour-name"
          name="name"
          placeholder="e.g. Kerala Fry"
          required
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name[0]}</p>
        )}
      </div>
      <div className="w-24 space-y-1">
        <Label htmlFor="flavour-code" className="text-xs">
          Code
        </Label>
        <Input
          id="flavour-code"
          name="code"
          placeholder="e.g. KF"
          className="uppercase"
          required
        />
        {errors.code && (
          <p className="text-xs text-red-500">{errors.code[0]}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
