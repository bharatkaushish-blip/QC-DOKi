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
import { StageCard } from "./stage-card";
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

interface Stage {
  id: string;
  name: string;
  order: number;
  isQcGate: boolean;
  active: boolean;
  fields: Field[];
}

export function StageList({
  stages,
  productId,
}: {
  stages: Stage[];
  productId: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...stages];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((s) => s.id);

    try {
      const res = await fetch(`/api/products/${productId}/stages/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      toast.success("Stages reordered.");
    } catch {
      toast.error("Failed to reorder stages.");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={stages.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} productId={productId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
