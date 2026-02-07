import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reorderSchema } from "@/lib/validators/stage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderedIds } = parsed.data;

    // Update each stage's order in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.processStage.update({
          where: { id },
          data: { order: index + 1, version: { increment: 1 } },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REORDER",
        entityType: "ProcessStage",
        entityId: params.id,
        newValue: { orderedIds },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder stages error:", error);
    return NextResponse.json(
      { error: "Failed to reorder stages" },
      { status: 500 }
    );
  }
}
