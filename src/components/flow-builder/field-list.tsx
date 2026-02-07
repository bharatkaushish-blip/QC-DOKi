"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FieldCard } from "./field-card";
import { toast } from "sonner";

interface Field {
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
}

export function FieldList({
  fields,
  stageId,
  productId,
}: {
  fields: Field[];
  stageId: string;
  productId: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Build new order
    const reordered = [...fields];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((f) => f.id);

    try {
      const res = await fetch(
        `/api/products/${productId}/stages/${stageId}/fields/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        }
      );
      if (!res.ok) throw new Error("Reorder failed");
      toast.success("Fields reordered.");
    } catch {
      toast.error("Failed to reorder fields.");
    }
  }

  if (fields.length === 0) {
    return (
      <p className="py-2 text-xs text-gray-400 text-center">No fields yet</p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} stageId={stageId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
