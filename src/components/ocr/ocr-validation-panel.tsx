"use client";

import { useState, useTransition } from "react";
import { commitOcrData } from "@/actions/ocr-actions";
import { OcrFieldRow } from "./ocr-field-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface FieldDef {
  id: string;
  name: string;
  labelEn: string;
  labelHi: string;
  fieldType: string;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  required: boolean;
}

interface MeasurementWithField {
  value: string;
  ocrRawValue: string | null;
  ocrConfidence: number | null;
  isCorrected: boolean;
  field: FieldDef;
}

interface OcrValidationPanelProps {
  stageRecordId: string;
  stageName: string;
  photoUrls: string[];
  measurements: MeasurementWithField[];
  fields: FieldDef[];
}

export function OcrValidationPanel({
  stageRecordId,
  stageName,
  photoUrls,
  measurements,
  fields,
}: OcrValidationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  // Initialize values from measurements
  const initialValues: Record<string, string> = {};
  for (const field of fields) {
    const m = measurements.find((m) => m.field.id === field.id);
    initialValues[field.id] = m?.value ?? "";
  }

  const [values, setValues] = useState<Record<string, string>>(initialValues);

  function handleFieldChange(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleCommit() {
    // Validate required fields
    const missingRequired = fields.filter(
      (f) => f.required && (!values[f.id] || values[f.id].trim() === "")
    );
    if (missingRequired.length > 0) {
      toast.error(
        `Missing required fields: ${missingRequired.map((f) => f.labelEn).join(", ")}`
      );
      return;
    }

    startTransition(async () => {
      const fieldValues = fields.map((f) => {
        const m = measurements.find((m) => m.field.id === f.id);
        const currentValue = values[f.id] ?? "";
        const ocrRawValue = m?.ocrRawValue ?? undefined;
        const isCorrected = ocrRawValue ? currentValue !== ocrRawValue : false;

        return {
          fieldId: f.id,
          value: currentValue,
          ocrRawValue,
          isCorrected,
          correctedFrom: isCorrected ? ocrRawValue : undefined,
        };
      });

      const result = await commitOcrData(stageRecordId, fieldValues);
      if ("error" in result) {
        toast.error(result.error as string);
        return;
      }
      toast.success("Data committed successfully.");
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Photo viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Form Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photoUrls.length > 0 ? (
            <div>
              <div className="rounded-lg border overflow-hidden bg-gray-50 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrls[selectedPhoto]}
                  alt={`Form photo ${selectedPhoto + 1}`}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
              {photoUrls.length > 1 && (
                <div className="flex gap-2">
                  {photoUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(idx)}
                      className={`w-16 h-16 rounded border overflow-hidden ${
                        idx === selectedPhoto
                          ? "ring-2 ring-blue-500"
                          : "opacity-60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No photos uploaded for this stage yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Right: Field editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {stageName} — Field Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields.map((field) => {
              const m = measurements.find((m) => m.field.id === field.id);
              return (
                <OcrFieldRow
                  key={field.id}
                  field={field}
                  measurement={
                    m
                      ? {
                          value: m.value,
                          ocrRawValue: m.ocrRawValue,
                          ocrConfidence: m.ocrConfidence,
                          isCorrected: m.isCorrected,
                        }
                      : undefined
                  }
                  value={values[field.id] ?? ""}
                  onChange={(v) => handleFieldChange(field.id, v)}
                />
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleCommit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Commit Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
