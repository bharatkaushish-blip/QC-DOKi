import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";
import { startOfDay } from "date-fns";
import { resolveDateRange } from "@/lib/date-utils";
import { DEFERRED_FLAVOUR_PRODUCT_CODES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const preset = searchParams.get("preset") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const todayStart = startOfDay(new Date());
    const { dateFrom, dateTo } = resolveDateRange({ preset, from, to });

    const [
      activeBatches,
      todayBatchesStarted,
      todayBatchesCompleted,
      totalAlerts,
      recentBatches,
    ] = await Promise.all([
      prisma.batch.count({
        where: {
          status: {
            in: [BatchStatus.IN_PROGRESS, BatchStatus.QC_PENDING],
          },
        },
      }),
      prisma.batch.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.batch.count({
        where: {
          status: {
            in: [
              BatchStatus.QC_APPROVED,
              BatchStatus.PACKAGED,
              BatchStatus.SHIPPED,
            ],
          },
          updatedAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.alert.count({
        where: {
          acknowledgedAt: null,
        },
      }),
      prisma.batch.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: {
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: {
          id: true,
          batchCode: true,
          status: true,
          createdAt: true,
          product: { select: { name: true } },
          flavour: { select: { name: true } },
        },
      }),
    ]);

    // Production totals
    const allProducts = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
    });

    const productionTotals = await Promise.all(
      allProducts.map(async (product) => {
        const isDeferred = DEFERRED_FLAVOUR_PRODUCT_CODES.includes(
          product.code as (typeof DEFERRED_FLAVOUR_PRODUCT_CODES)[number]
        );

        if (isDeferred) {
          const splits = await prisma.batchFlavourSplit.findMany({
            where: {
              batch: {
                productId: product.id,
                createdAt: { gte: dateFrom, lte: dateTo },
              },
            },
            include: {
              flavour: { select: { name: true, code: true } },
            },
          });

          const flavourMap = new Map<
            string,
            { flavourName: string; flavourCode: string; totalPacks: number }
          >();

          for (const split of splits) {
            const key = split.flavour.code;
            const existing = flavourMap.get(key);
            if (existing) {
              existing.totalPacks += split.packCount;
            } else {
              flavourMap.set(key, {
                flavourName: split.flavour.name,
                flavourCode: split.flavour.code,
                totalPacks: split.packCount,
              });
            }
          }

          const flavourBreakdown = Array.from(flavourMap.values());
          const totalPacks = flavourBreakdown.reduce(
            (s, f) => s + f.totalPacks,
            0
          );

          return {
            productName: product.name,
            productCode: product.code,
            totalPacks,
            flavourBreakdown,
          };
        } else {
          const measurements = await prisma.measurement.findMany({
            where: {
              field: {
                name: { contains: "pack", mode: "insensitive" as const },
              },
              stageRecord: {
                batch: {
                  productId: product.id,
                  createdAt: { gte: dateFrom, lte: dateTo },
                },
              },
            },
          });

          const totalPacks = measurements.reduce((sum, m) => {
            const val = parseFloat(m.value);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);

          return {
            productName: product.name,
            productCode: product.code,
            totalPacks,
            flavourBreakdown: [] as { flavourName: string; flavourCode: string; totalPacks: number }[],
          };
        }
      })
    );

    const grandTotal = productionTotals.reduce(
      (sum, p) => sum + p.totalPacks,
      0
    );

    return NextResponse.json({
      activeBatches,
      todayBatchesStarted,
      todayBatchesCompleted,
      totalAlerts,
      recentBatches,
      productionTotals,
      grandTotal,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
