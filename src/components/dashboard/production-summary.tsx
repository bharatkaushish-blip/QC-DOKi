"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, TrendingUp } from "lucide-react";

interface FlavourBreakdown {
  flavourName: string;
  flavourCode: string;
  totalPacks: number;
}

interface ProductSummary {
  productName: string;
  productCode: string;
  totalPacks: number;
  flavourBreakdown: FlavourBreakdown[];
}

interface ProductionSummaryProps {
  products: ProductSummary[];
  grandTotal: number;
}

export function ProductionSummary({
  products,
  grandTotal,
}: ProductionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Production Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Grand total */}
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Total Packs Produced
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-700">
              {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Per-product breakdown */}
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No production data for the selected period.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.productCode} className="border rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {product.productName}{" "}
                    <span className="text-gray-400">({product.productCode})</span>
                  </span>
                  <span className="font-mono font-semibold text-sm">
                    {product.totalPacks.toLocaleString()} packs
                  </span>
                </div>
                {product.flavourBreakdown.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Flavour</TableHead>
                        <TableHead className="text-xs text-right">
                          Packs
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.flavourBreakdown.map((fb) => (
                        <TableRow key={fb.flavourCode}>
                          <TableCell className="text-sm py-2">
                            {fb.flavourName}{" "}
                            <span className="text-gray-400">
                              ({fb.flavourCode})
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm py-2">
                            {fb.totalPacks.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
