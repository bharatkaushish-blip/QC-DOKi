import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getSuppliers } from "@/actions/supplier-actions";
import { SupplierListTable } from "@/components/suppliers/supplier-list-table";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage raw material suppliers">
        <Link href="/suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </Link>
      </PageHeader>

      {suppliers.length === 0 ? (
        <div className="rounded-lg border bg-white">
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add your first supplier to start tracking raw materials."
          >
            <Link href="/suppliers/new">
              <Button size="sm">Add Supplier</Button>
            </Link>
          </EmptyState>
        </div>
      ) : (
        <SupplierListTable suppliers={suppliers} />
      )}
    </div>
  );
}
