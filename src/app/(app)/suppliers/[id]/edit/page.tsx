import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { getSupplier } from "@/actions/supplier-actions";

export default async function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const supplier = await getSupplier(params.id);

  if (!supplier) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Supplier"
        description={`Editing ${supplier.name}`}
      />
      <SupplierForm supplier={supplier} />
    </div>
  );
}
