import { PageHeader } from "@/components/shared/page-header";
import { getProducts } from "@/actions/product-actions";
import { ProductCard } from "@/components/products/product-card";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage products, flavours, and process flows"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
