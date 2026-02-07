import { prisma } from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";
import { startOfDay } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { TodaySummaryCards } from "@/components/dashboard/today-summary-cards";
import { ActiveBatchesPanel } from "@/components/dashboard/active-batches-panel";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";

export default async function DashboardPage() {
  const todayStart = startOfDay(new Date());

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
        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveBatchesPanel batches={serializedBatches} />
          <AlertsPanel alerts={serializedAlerts} />
        </div>
      </div>
    </div>
  );
}
