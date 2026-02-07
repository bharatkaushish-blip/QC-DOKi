import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    await requireAuth();

    const todayStart = startOfDay(new Date());

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

    return NextResponse.json({
      activeBatches,
      todayBatchesStarted,
      todayBatchesCompleted,
      totalAlerts,
      recentBatches,
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
