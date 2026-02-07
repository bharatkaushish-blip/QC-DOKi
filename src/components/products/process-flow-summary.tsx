import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  order: number;
  isQcGate: boolean;
  active: boolean;
  fields: { id: string; active: boolean }[];
}

export function ProcessFlowSummary({
  productId,
  stages,
}: {
  productId: string;
  stages: Stage[];
}) {
  const activeStages = stages.filter((s) => s.active);

  if (activeStages.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          No process stages configured yet.
        </p>
        <Link href={`/products/${productId}/flow`}>
          <Button size="sm" variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Configure Flow
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {activeStages.length} stages configured
        </p>
        <Link href={`/products/${productId}/flow`}>
          <Button size="sm" variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Edit Flow
          </Button>
        </Link>
      </div>
      <div className="space-y-2">
        {activeStages.map((stage) => {
          const activeFields = stage.fields.filter((f) => f.active);
          return (
            <div
              key={stage.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {stage.order}
              </span>
              <span className="flex-1 text-sm font-medium">{stage.name}</span>
              {stage.isQcGate && (
                <Badge variant="destructive" className="text-xs">
                  QC Gate
                </Badge>
              )}
              <span className="text-xs text-gray-400">
                {activeFields.length} fields
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
