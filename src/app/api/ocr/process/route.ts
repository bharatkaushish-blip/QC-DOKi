import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractFormData } from "@/lib/ocr";

interface FlowSnapshotField {
  fieldId: string;
  name: string;
  labelEn: string;
  fieldType: string;
  unit: string | null;
}

interface FlowSnapshotStage {
  stageId: string;
  name: string;
  order: number;
  isQcGate: boolean;
  fields: FlowSnapshotField[];
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { batchId, stageRecordId } = await request.json();

    if (!batchId || !stageRecordId) {
      return NextResponse.json(
        { error: "batchId and stageRecordId are required" },
        { status: 400 }
      );
    }

    // Get the stage record with its batch
    const stageRecord = await prisma.stageRecord.findUnique({
      where: { id: stageRecordId },
      include: {
        batch: {
          select: { id: true, flowSnapshot: true },
        },
      },
    });

    if (!stageRecord || stageRecord.batch.id !== batchId) {
      return NextResponse.json(
        { error: "Stage record not found" },
        { status: 404 }
      );
    }

    if (stageRecord.formPhotoUrls.length === 0) {
      return NextResponse.json(
        { error: "No photos uploaded for this stage record" },
        { status: 400 }
      );
    }

    // Get field definitions from the batch flow snapshot
    const flowSnapshot = stageRecord.batch.flowSnapshot as FlowSnapshotStage[] | null;

    if (!flowSnapshot || flowSnapshot.length === 0) {
      return NextResponse.json(
        { error: "No flow snapshot found for this batch" },
        { status: 400 }
      );
    }

    const stageSnapshot = flowSnapshot.find(
      (s) => s.stageId === stageRecord.stageId
    );

    if (!stageSnapshot || stageSnapshot.fields.length === 0) {
      return NextResponse.json(
        { error: "No fields found for this stage in the flow snapshot" },
        { status: 400 }
      );
    }

    // Update OCR status to PROCESSING
    await prisma.stageRecord.update({
      where: { id: stageRecordId },
      data: { ocrStatus: "PROCESSING" },
    });

    try {
      // Process each photo through OCR
      const allResults: Array<{
        fieldId: string;
        rawValue: string;
        confidence: number;
      }> = [];

      const fields = stageSnapshot.fields.map((f) => ({
        fieldId: f.fieldId,
        name: f.name,
        labelEn: f.labelEn,
        fieldType: f.fieldType,
        unit: f.unit ?? undefined,
      }));

      for (const photoUrl of stageRecord.formPhotoUrls) {
        const results = await extractFormData(photoUrl, fields);
        allResults.push(...results);
      }

      // Merge results: for each field, pick the result with highest confidence
      const bestByField = new Map<
        string,
        { rawValue: string; confidence: number }
      >();

      for (const result of allResults) {
        const existing = bestByField.get(result.fieldId);
        if (!existing || result.confidence > existing.confidence) {
          bestByField.set(result.fieldId, {
            rawValue: result.rawValue,
            confidence: result.confidence,
          });
        }
      }

      // Delete existing OCR measurements for this stage record to avoid duplicates
      await prisma.measurement.deleteMany({
        where: {
          stageRecordId,
          ocrRawValue: { not: null },
          isCorrected: false,
        },
      });

      // Create Measurement records
      const measurements: Array<{
        stageRecordId: string;
        fieldId: string;
        value: string;
        ocrRawValue: string;
        ocrConfidence: number;
      }> = [];

      for (const [fieldId, data] of Array.from(bestByField.entries())) {
        measurements.push({
          stageRecordId,
          fieldId,
          value: data.rawValue,
          ocrRawValue: data.rawValue,
          ocrConfidence: data.confidence,
        });
      }

      if (measurements.length > 0) {
        await prisma.measurement.createMany({
          data: measurements,
        });
      }

      // Calculate average confidence
      const confidences = measurements.map((m) => m.ocrConfidence);
      const avgConfidence =
        confidences.length > 0
          ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
          : 0;

      // Update stage record with completion status
      await prisma.stageRecord.update({
        where: { id: stageRecordId },
        data: {
          ocrStatus: "COMPLETED",
          ocrConfidenceAvg: Math.round(avgConfidence * 100) / 100,
          ocrRawResult: JSON.parse(JSON.stringify(allResults)),
        },
      });

      return NextResponse.json({
        success: true,
        measurementCount: measurements.length,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
      });
    } catch (ocrError) {
      // On OCR failure, update status to FAILED
      await prisma.stageRecord.update({
        where: { id: stageRecordId },
        data: { ocrStatus: "FAILED" },
      });

      console.error("OCR processing error:", ocrError);
      return NextResponse.json(
        { error: "OCR processing failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("OCR process route error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR" },
      { status: 500 }
    );
  }
}
