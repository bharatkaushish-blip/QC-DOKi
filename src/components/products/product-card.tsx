"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/ui/spotlight-card";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Beef, Cookie, Popcorn } from "lucide-react";

const iconMap = {
  Beef,
  Cookie,
  Popcorn,
} as const;

const glowColorForCategory: Record<string, "orange" | "blue" | "purple" | "green" | "red"> = {
  jerky: "orange",
  chips: "blue",
  puffs: "purple",
};

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
  const glowColor = glowColorForCategory[product.category] ?? "blue";

  return (
    <Link href={`/products/${product.id}`} className="block">
      <GlowCard
        glowColor={glowColor}
        customSize
        className="w-full h-auto aspect-auto cursor-pointer p-0 gap-0 grid-rows-1 shadow-[0_0.5rem_1.5rem_-0.5rem_rgba(0,0,0,0.15)]"
      >
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-white/80 p-2.5 shadow-sm">
              <Icon className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {product.name}
              </h3>
              <Badge variant="outline" className="mt-0.5 bg-white/60">
                {product.code}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white/50 p-2.5 text-center">
              <div className="text-xl font-bold text-gray-900">
                {product._count.flavours}
              </div>
              <div className="text-gray-600 text-xs font-medium">Flavours</div>
            </div>
            <div className="rounded-lg bg-white/50 p-2.5 text-center">
              <div className="text-xl font-bold text-gray-900">
                {product._count.processStages}
              </div>
              <div className="text-gray-600 text-xs font-medium">Stages</div>
            </div>
            <div className="rounded-lg bg-white/50 p-2.5 text-center">
              <div className="text-xl font-bold text-gray-900">
                {product._count.batches}
              </div>
              <div className="text-gray-600 text-xs font-medium">Batches</div>
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
