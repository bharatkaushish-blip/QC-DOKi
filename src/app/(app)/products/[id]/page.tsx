import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings2 } from "lucide-react";
import { getProduct } from "@/actions/product-actions";
import { FlavourList } from "@/components/products/flavour-list";
import { FlavourForm } from "@/components/products/flavour-form";
import { ProcessFlowSummary } from "@/components/products/process-flow-summary";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const category =
    PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES];

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <PageHeader
        title={product.name}
        description={
          <span className="flex items-center gap-2">
            <Badge variant="outline">{product.code}</Badge>
            {category && (
              <Badge variant="secondary">{category.label}</Badge>
            )}
          </span>
        }
      >
        <Link href={`/products/${product.id}/flow`}>
          <Button variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Edit Process Flow
          </Button>
        </Link>
      </PageHeader>

      <Tabs defaultValue="flavours" className="mt-6">
        <TabsList>
          <TabsTrigger value="flavours">
            Flavours ({product.flavours.filter((f) => f.active).length})
          </TabsTrigger>
          <TabsTrigger value="flow">
            Process Flow ({product.processStages.filter((s) => s.active).length}{" "}
            stages)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flavours">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Flavour</CardTitle>
            </CardHeader>
            <CardContent>
              <FlavourForm productId={product.id} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">All Flavours</CardTitle>
            </CardHeader>
            <CardContent>
              <FlavourList flavours={product.flavours} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow">
          <Card>
            <CardContent className="pt-6">
              <ProcessFlowSummary
                productId={product.id}
                stages={product.processStages}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
