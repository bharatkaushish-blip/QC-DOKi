"use client";

import { useTransition } from "react";
import { toggleFieldActive } from "@/actions/stage-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, RotateCcw, GripVertical } from "lucide-react";
import { FieldForm } from "./field-form";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FieldCardProps {
  field: {
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
    active: boolean;
    order: number;
  };
  stageId: string;
}

const fieldTypeColors: Record<string, string> = {
  NUMBER: "bg-blue-100 text-blue-700",
  TEXT: "bg-gray-100 text-gray-700",
  BOOLEAN: "bg-green-100 text-green-700",
  SELECT: "bg-purple-100 text-purple-700",
  DATETIME: "bg-orange-100 text-orange-700",
};

export function FieldCard({ field, stageId }: FieldCardProps) {
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFieldActive(field.id);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success(field.active ? "Field archived." : "Field restored.");
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded border px-2 py-1.5 text-sm ${
        !field.active ? "opacity-50 bg-gray-50" : "bg-white"
      }`}
    >
      <button
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span className="flex-1 font-medium truncate">{field.labelEn}</span>
      <span className="text-xs text-gray-400 truncate max-w-[100px]">
        {field.labelHi}
      </span>
      <Badge
        variant="outline"
        className={`text-xs ${fieldTypeColors[field.fieldType] ?? ""}`}
      >
        {field.fieldType}
      </Badge>
      {field.unit && (
        <span className="text-xs text-gray-500">{field.unit}</span>
      )}
      {field.minValue != null && field.maxValue != null && (
        <span className="text-xs text-gray-400">
          [{field.minValue}–{field.maxValue}]
        </span>
      )}
      <FieldForm stageId={stageId} field={field} />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={handleToggle}
        disabled={isPending}
      >
        {field.active ? (
          <Archive className="h-3 w-3" />
        ) : (
          <RotateCcw className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
