import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PdfFormDocument } from "@/components/forms/pdf-form-document";
import { format } from "date-fns";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { batchId, stageIndex } = await request.json();

    if (!batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        product: { select: { name: true } },
        flavour: { select: { name: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const flowSnapshot = batch.flowSnapshot as Array<{
      stageId: string;
      name: string;
      order: number;
      isQcGate: boolean;
      fields: Array<{
        fieldId: string;
        name: string;
        labelEn: string;
        labelHi: string;
        fieldType: string;
        unit: string | null;
        minValue: number | null;
        maxValue: number | null;
        required: boolean;
      }>;
    }>;

    if (!flowSnapshot || flowSnapshot.length === 0) {
      return NextResponse.json(
        { error: "No flow snapshot found for this batch" },
        { status: 400 }
      );
    }

    // If stageIndex is provided, generate for that stage. Otherwise, generate all.
    const stagesToRender =
      stageIndex != null
        ? [flowSnapshot[stageIndex]]
        : flowSnapshot;

    // For single stage, render a single PDF
    const stage = stagesToRender[0];
    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const element = React.createElement(PdfFormDocument, {
      batchCode: batch.batchCode,
      productName: batch.product.name,
      flavourName: batch.flavour.name,
      date: format(new Date(batch.createdAt), "dd MMM yyyy"),
      stage,
    });

    // renderToBuffer expects a Document element — PdfFormDocument wraps in <Document>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${batch.batchCode}_Stage${stage.order}_${stage.name.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
