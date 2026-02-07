"use client";

import { useTransition, useState } from "react";
import { createStage, updateStage } from "@/actions/stage-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

interface StageFormProps {
  productId: string;
  stage?: {
    id: string;
    name: string;
    isQcGate: boolean;
  };
}

export function StageForm({ productId, stage }: StageFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const isEditing = !!stage;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateStage(stage!.id, formData)
        : await createStage(productId, formData);

      if ("error" in result) {
        const err = result.error;
        if (typeof err === "string") {
          toast.error(err);
        } else {
          setErrors(err as Record<string, string[]>);
          toast.error("Please fix the errors.");
        }
        return;
      }

      toast.success(isEditing ? "Stage updated." : "Stage added.");
      setErrors({});
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Stage
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Stage" : "Add Stage"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-name">Stage Name</Label>
            <Input
              id="stage-name"
              name="name"
              defaultValue={stage?.name ?? ""}
              placeholder="e.g. Raw Material Intake"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isQcGate"
              name="isQcGate"
              defaultChecked={stage?.isQcGate ?? false}
              onCheckedChange={(checked) => {
                const hidden = document.getElementById(
                  "isQcGate-hidden"
                ) as HTMLInputElement;
                if (hidden) hidden.value = String(checked);
              }}
            />
            <input
              type="hidden"
              id="isQcGate-hidden"
              name="isQcGate"
              defaultValue={String(stage?.isQcGate ?? false)}
            />
            <Label htmlFor="isQcGate">QC Gate (requires approval to pass)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Add Stage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
