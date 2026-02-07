import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reorderSchema } from "@/lib/validators/stage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; stageId: string } }
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

    await prisma.$transaction([
      ...orderedIds.map((id, index) =>
        prisma.stageField.update({
          where: { id },
          data: { order: index + 1 },
        })
      ),
      prisma.processStage.update({
        where: { id: params.stageId },
        data: { version: { increment: 1 } },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REORDER",
        entityType: "StageField",
        entityId: params.stageId,
        newValue: { orderedIds },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder fields error:", error);
    return NextResponse.json(
      { error: "Failed to reorder fields" },
      { status: 500 }
    );
  }
}
