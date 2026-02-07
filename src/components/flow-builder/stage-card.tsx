"use client";

import { useState, useTransition } from "react";
import { toggleStageActive } from "@/actions/stage-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Archive,
  RotateCcw,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StageForm } from "./stage-form";
import { FieldForm } from "./field-form";
import { FieldList } from "./field-list";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface StageCardProps {
  stage: {
    id: string;
    name: string;
    order: number;
    isQcGate: boolean;
    active: boolean;
    fields: Field[];
  };
  productId: string;
}

export function StageCard({ stage, productId }: StageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleStageActive(stage.id);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success(stage.active ? "Stage archived." : "Stage restored.");
    });
  }

  const activeFields = stage.fields.filter((f) => f.active);
  const archivedFields = stage.fields.filter((f) => !f.active);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={!stage.active ? "opacity-50" : ""}>
        <CardHeader className="flex flex-row items-center gap-2 py-3 px-4">
          <button
            className="cursor-grab text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
            {stage.order}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <span className="flex-1 font-medium">{stage.name}</span>

          {stage.isQcGate && (
            <Badge variant="destructive" className="text-xs">
              QC Gate
            </Badge>
          )}

          <span className="text-xs text-gray-400">
            {activeFields.length} fields
          </span>

          <StageForm productId={productId} stage={stage} />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleToggle}
            disabled={isPending}
          >
            {stage.active ? (
              <Archive className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        {expanded && (
          <CardContent className="pt-0 px-4 pb-4">
            <div className="ml-14">
              <FieldList
                fields={activeFields}
                stageId={stage.id}
                productId={productId}
              />
              {archivedFields.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">
                    {archivedFields.length} archived field(s)
                  </summary>
                  <div className="mt-1 space-y-1">
                    {archivedFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 rounded border border-dashed px-2 py-1.5 text-sm opacity-50"
                      >
                        <span className="flex-1">{field.labelEn}</span>
                        <FieldForm stageId={stage.id} field={field} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            startTransition(async () => {
                              const { toggleFieldActive } = await import(
                                "@/actions/stage-actions"
                              );
                              await toggleFieldActive(field.id);
                              toast.success("Field restored.");
                            });
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="mt-2">
                <FieldForm stageId={stage.id} />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
