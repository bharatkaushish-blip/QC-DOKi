import { prisma } from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";
import { startOfDay } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { TodaySummaryCards } from "@/components/dashboard/today-summary-cards";
import { ActiveBatchesPanel } from "@/components/dashboard/active-batches-panel";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { DateFilter } from "@/components/dashboard/date-filter";
import { ProductionSummary } from "@/components/dashboard/production-summary";
import { resolveDateRange } from "@/lib/date-utils";
import { DEFERRED_FLAVOUR_PRODUCT_CODES } from "@/lib/constants";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { preset?: string; from?: string; to?: string };
}) {
  const todayStart = startOfDay(new Date());
  const { dateFrom, dateTo } = resolveDateRange(searchParams);

  const [
    activeBatches,
    todayBatchesStarted,
    todayBatchesCompleted,
    totalAlerts,
    recentBatches,
    recentAlerts,
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
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
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
    prisma.alert.findMany({
      where: {
        acknowledgedAt: null,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        severity: true,
        message: true,
        createdAt: true,
        batch: { select: { batchCode: true } },
      },
    }),
  ]);

  // ── Production summary: packs by product + flavour breakdown ──
  const allProducts = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
  });

  const productSummaries = await Promise.all(
    allProducts.map(async (product) => {
      const isDeferred = DEFERRED_FLAVOUR_PRODUCT_CODES.includes(
        product.code as (typeof DEFERRED_FLAVOUR_PRODUCT_CODES)[number]
      );

      if (isDeferred) {
        // For CC/PP: aggregate from BatchFlavourSplit
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

        const flavourBreakdown = Array.from(flavourMap.values()).sort(
          (a, b) => b.totalPacks - a.totalPacks
        );
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
        // For BJ/CJ: look for measurements with field name containing "pack"
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

  const grandTotal = productSummaries.reduce(
    (sum, p) => sum + p.totalPacks,
    0
  );

  // Serialize dates for client components
  const serializedBatches = recentBatches.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  const serializedAlerts = recentAlerts.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your manufacturing operations"
      />
      <div className="space-y-6">
        <TodaySummaryCards
          activeBatches={activeBatches}
          todayStarted={todayBatchesStarted}
          todayCompleted={todayBatchesCompleted}
          totalAlerts={totalAlerts}
        />

        <Suspense fallback={null}>
          <DateFilter />
        </Suspense>

        <ProductionSummary
          products={productSummaries}
          grandTotal={grandTotal}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveBatchesPanel batches={serializedBatches} />
          <AlertsPanel alerts={serializedAlerts} />
        </div>
      </div>
    </div>
  );
}
