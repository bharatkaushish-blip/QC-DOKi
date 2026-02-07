"use client";

import { useTransition, useState } from "react";
import { createField, updateField } from "@/actions/stage-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { FIELD_TYPES } from "@/lib/constants";

interface FieldFormProps {
  stageId: string;
  field?: {
    id: string;
    name: string;
    labelEn: string;
    labelHi: string;
    fieldType: string;
    unit: string | null;
    minValue: number | null;
    maxValue: number | null;
    required: boolean;
    options: string | null;
  };
}

export function FieldForm({ stageId, field }: FieldFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [fieldType, setFieldType] = useState(field?.fieldType ?? "TEXT");
  const isEditing = !!field;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateField(field!.id, formData)
        : await createField(stageId, formData);

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

      toast.success(isEditing ? "Field updated." : "Field added.");
      setErrors({});
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            Add Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Field" : "Add Field"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="field-name">Field Name (code)</Label>
            <Input
              id="field-name"
              name="name"
              defaultValue={field?.name ?? ""}
              placeholder="e.g. weight_received"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="field-labelEn">English Label</Label>
              <Input
                id="field-labelEn"
                name="labelEn"
                defaultValue={field?.labelEn ?? ""}
                placeholder="Weight Received"
                required
              />
              {errors.labelEn && (
                <p className="text-xs text-red-500">{errors.labelEn[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-labelHi">Hindi Label</Label>
              <Input
                id="field-labelHi"
                name="labelHi"
                defaultValue={field?.labelHi ?? ""}
                placeholder="प्राप्त वज़न"
                required
              />
              {errors.labelHi && (
                <p className="text-xs text-red-500">{errors.labelHi[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Field Type</Label>
              <input type="hidden" name="fieldType" value={fieldType} />
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-unit">Unit</Label>
              <Input
                id="field-unit"
                name="unit"
                defaultValue={field?.unit ?? ""}
                placeholder="e.g. kg, °C, pH"
              />
            </div>
          </div>

          {fieldType === "NUMBER" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="field-min">Min Value</Label>
                <Input
                  id="field-min"
                  name="minValue"
                  type="number"
                  step="any"
                  defaultValue={field?.minValue ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-max">Max Value</Label>
                <Input
                  id="field-max"
                  name="maxValue"
                  type="number"
                  step="any"
                  defaultValue={field?.maxValue ?? ""}
                />
              </div>
            </div>
          )}

          {fieldType === "SELECT" && (
            <div className="space-y-2">
              <Label htmlFor="field-options">Options (comma-separated)</Label>
              <Input
                id="field-options"
                name="options"
                defaultValue={field?.options ?? ""}
                placeholder="e.g. Good,Fair,Poor"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              id="field-required"
              defaultChecked={field?.required ?? true}
              onCheckedChange={(checked) => {
                const hidden = document.getElementById(
                  "required-hidden"
                ) as HTMLInputElement;
                if (hidden) hidden.value = String(checked);
              }}
            />
            <input
              type="hidden"
              id="required-hidden"
              name="required"
              defaultValue={String(field?.required ?? true)}
            />
            <Label htmlFor="field-required">Required</Label>
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
              {isEditing ? "Update" : "Add Field"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
