import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getBatches } from "@/actions/batch-actions";
import { BatchListTable } from "@/components/batches/batch-list-table";

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div>
      <PageHeader title="Batches" description="Manage production batches">
        <Link href="/batches/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
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
