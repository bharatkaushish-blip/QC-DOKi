"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUploadZone } from "@/components/ocr/photo-upload-zone";
import { OcrStatusIndicator } from "@/components/ocr/ocr-status-indicator";
import type { OcrStatus } from "@prisma/client";

interface StageInfo {
  stageRecordId: string;
  stageId: string;
  stageName: string;
  stageOrder: number;
  isQcGate: boolean;
  formPhotoUrls: string[];
  ocrStatus: OcrStatus;
  ocrConfidenceAvg: number | null;
}

interface UploadStageSelectorProps {
  batchId: string;
  stages: StageInfo[];
}

export function UploadStageSelector({
  batchId,
  stages,
}: UploadStageSelectorProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    router.refresh();
  };

  if (stages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">
          No stages found for this batch.
        </CardContent>
      </Card>
    );
  }

  const defaultStage = stages[0].stageId;

  return (
    <Tabs defaultValue={defaultStage}>
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        {stages.map((stage) => (
          <TabsTrigger key={stage.stageId} value={stage.stageId}>
            <span className="flex items-center gap-1.5">
              <span>
                {stage.stageOrder}. {stage.stageName}
              </span>
              {stage.formPhotoUrls.length > 0 && (
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                  {stage.formPhotoUrls.length}
                </span>
              )}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {stages.map((stage) => (
        <TabsContent key={stage.stageId} value={stage.stageId}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {stage.stageName}
                  {stage.isQcGate && (
                    <span className="ml-2 text-xs font-normal text-yellow-600">
                      (QC Gate)
                    </span>
                  )}
                </CardTitle>
                <OcrStatusIndicator
                  status={stage.ocrStatus}
                  confidenceAvg={stage.ocrConfidenceAvg}
                />
              </div>
            </CardHeader>
            <CardContent>
              <PhotoUploadZone
                batchId={batchId}
                stageId={stage.stageId}
                stageRecordId={stage.stageRecordId}
                existingPhotos={stage.formPhotoUrls}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
