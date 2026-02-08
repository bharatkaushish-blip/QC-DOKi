import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getBatches } from "@/actions/batch-actions";
import { BatchListTable } from "@/components/batches/batch-list-table";

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div>
      <PageHeader title="Batches" description="Manage production batches">
        <Link href="/batches/new">
          <Button className="group relative overflow-hidden" size="lg">
            <Plus className="mr-1 h-4 w-4 transition-opacity duration-500 group-hover:opacity-0" />
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
              Create Batch
            </span>
            <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </i>
          </Button>
        </Link>
      </PageHeader>

      {batches.length === 0 ? (
        <div className="rounded-lg border bg-white">
          <EmptyState
            icon={Package}
            title="No batches yet"
            description="Create your first production batch to get started."
          >
            <Link href="/batches/new">
              <Button size="sm">Create Batch</Button>
            </Link>
          </EmptyState>
        </div>
      ) : (
        <BatchListTable batches={batches} />
      )}
    </div>
  );
}
