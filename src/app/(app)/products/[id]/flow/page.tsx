import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "@/actions/product-actions";
import { StageList } from "@/components/flow-builder/stage-list";
import { StageForm } from "@/components/flow-builder/stage-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Layers } from "lucide-react";

export default async function FlowBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const activeStages = product.processStages
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  const archivedStages = product.processStages.filter((s) => !s.active);

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {product.name}
        </Link>
      </div>

      <PageHeader
        title={`${product.name} — Process Flow`}
        description="Drag to reorder stages. Click a stage to expand and manage fields."
      >
        <StageForm productId={product.id} />
      </PageHeader>

      {activeStages.length === 0 ? (
        <div className="rounded-lg border bg-white">
          <EmptyState
            icon={Layers}
            title="No process stages"
            description="Add your first stage to start building the process flow."
          >
            <StageForm productId={product.id} />
          </EmptyState>
        </div>
      ) : (
        <StageList stages={activeStages} productId={product.id} />
      )}

      {archivedStages.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-gray-400 cursor-pointer mb-3">
            {archivedStages.length} archived stage(s)
          </summary>
          <div className="space-y-3 opacity-60">
            {archivedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center gap-3 rounded-lg border border-dashed p-3"
              >
                <span className="flex-1 text-sm font-medium">{stage.name}</span>
                <StageForm productId={product.id} stage={stage} />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
