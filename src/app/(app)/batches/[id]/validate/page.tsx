import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getBatchWithDetails } from "@/actions/batch-actions";
import { OcrValidationPanel } from "@/components/ocr/ocr-validation-panel";

export default async function ValidatePage({
  params,
}: {
  params: { id: string };
}) {
  const batch = await getBatchWithDetails(params.id);

  if (!batch) {
    notFound();
  }

  // Get field definitions from flow snapshot
  const flowSnapshot = batch.flowSnapshot as Array<{
    stageId: string;
    name: string;
    order: number;
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

  const stageRecords = batch.stageRecords.sort(
    (a, b) => a.stage.order - b.stage.order
  );

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/batches/${batch.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {batch.batchCode}
        </Link>
      </div>

      <PageHeader
        title="Validate & Correct Data"
        description={`${batch.batchCode} — ${batch.product.name}${batch.flavour ? ` — ${batch.flavour.name}` : " — Flavour pending"}`}
      />

      <Tabs defaultValue={stageRecords[0]?.id}>
        <TabsList className="flex-wrap">
          {stageRecords.map((sr) => (
            <TabsTrigger key={sr.id} value={sr.id} className="text-xs">
              {sr.stage.order}. {sr.stage.name}
              {sr.committedAt && (
                <Badge className="ml-1 bg-green-100 text-green-700 text-xs">
                  Done
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {stageRecords.map((sr) => {
          const stageSnapshot = flowSnapshot?.find(
            (s) => s.stageId === sr.stageId
          );
          const fields = (stageSnapshot?.fields ?? []).map((f) => ({
            id: f.fieldId,
            name: f.name,
            labelEn: f.labelEn,
            labelHi: f.labelHi,
            fieldType: f.fieldType,
            unit: f.unit,
            minValue: f.minValue,
            maxValue: f.maxValue,
            required: f.required,
          }));

          return (
            <TabsContent key={sr.id} value={sr.id}>
              <OcrValidationPanel
                stageRecordId={sr.id}
                stageName={sr.stage.name}
                photoUrls={sr.formPhotoUrls}
                measurements={sr.measurements.map((m) => ({
                  value: m.value,
                  ocrRawValue: m.ocrRawValue,
                  ocrConfidence: m.ocrConfidence,
                  isCorrected: m.isCorrected,
                  field: m.field,
                }))}
                fields={fields}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
