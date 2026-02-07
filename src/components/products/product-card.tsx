import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Beef, Cookie, Popcorn } from "lucide-react";

const iconMap = {
  Beef,
  Cookie,
  Popcorn,
} as const;

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    code: string;
    category: string;
    _count: {
      flavours: number;
      processStages: number;
      batches: number;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const category =
    PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES];
  const Icon = category ? iconMap[category.icon as keyof typeof iconMap] : Beef;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="rounded-lg bg-gray-100 p-2">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {product.code}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            <div>
              <div className="font-semibold text-gray-900">
                {product._count.flavours}
              </div>
              <div>Flavours</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {product._count.processStages}
              </div>
              <div>Stages</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {product._count.batches}
              </div>
              <div>Batches</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
