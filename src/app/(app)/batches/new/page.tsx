import { PageHeader } from "@/components/shared/page-header";
import { BatchCreateForm } from "@/components/batches/batch-create-form";
import { getProducts } from "@/actions/product-actions";
import { getSuppliers } from "@/actions/supplier-actions";

export default async function NewBatchPage() {
  const [products, suppliers] = await Promise.all([
    getProducts(),
    getSuppliers(),
  ]);

  // Map products to include only active flavours
  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    flavours: p.flavours.map((f) => ({
      id: f.id,
      name: f.name,
      code: f.code,
    })),
  }));

  const supplierOptions = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <div>
      <PageHeader
        title="Create Batch"
        description="Start a new production batch"
      />
      <BatchCreateForm products={productOptions} suppliers={supplierOptions} />
    </div>
  );
}
