import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFormPhoto } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const batchId = formData.get("batchId") as string;
    const stageId = formData.get("stageId") as string;

    if (!batchId || !stageId) {
      return NextResponse.json(
        { error: "batchId and stageId are required" },
        { status: 400 }
      );
    }

    // Verify the batch exists and belongs to a valid stage record
    const stageRecord = await prisma.stageRecord.findUnique({
      where: {
        batchId_stageId: { batchId, stageId },
      },
    });

    if (!stageRecord) {
      return NextResponse.json(
        { error: "Stage record not found" },
        { status: 404 }
      );
    }

    // Collect all files from form data
    const files: File[] = [];
    const fileEntries = formData.getAll("file");
    for (const value of fileEntries) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 }
      );
    }

    // Upload each file and collect URLs
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${batchId}/${stageId}/${safeFilename}`;

      const publicUrl = await uploadFormPhoto(buffer, filename);
      uploadedUrls.push(publicUrl);
    }

    // Update the stage record: append photo URLs and set startedAt if not already set
    const updateData: {
      formPhotoUrls: string[];
      startedAt?: Date;
      recordedById?: string;
    } = {
      formPhotoUrls: [...stageRecord.formPhotoUrls, ...uploadedUrls],
    };

    if (!stageRecord.startedAt) {
      updateData.startedAt = new Date();
      updateData.recordedById = user.id;
    }

    const updated = await prisma.stageRecord.update({
      where: { id: stageRecord.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      stageRecordId: updated.id,
      uploadedUrls,
      totalPhotos: updated.formPhotoUrls.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}
