"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface MeasurementData {
  value: string;
  ocrRawValue: string | null;
  ocrConfidence: number | null;
  isCorrected: boolean;
}

interface OcrFieldRowProps {
  field: FieldDef;
  measurement?: MeasurementData;
  value: string;
  onChange: (value: string) => void;
  options?: string;
}

function getConfidenceBadge(confidence: number | null | undefined) {
  if (confidence == null) return null;
  const pct = Math.round(confidence * 100);
  if (pct >= 80) return <Badge className="bg-green-100 text-green-700 text-xs">{pct}%</Badge>;
  if (pct >= 50) return <Badge className="bg-yellow-100 text-yellow-700 text-xs">{pct}%</Badge>;
  return <Badge className="bg-red-100 text-red-700 text-xs">{pct}%</Badge>;
}

export function OcrFieldRow({
  field,
  measurement,
  value,
  onChange,
  options,
}: OcrFieldRowProps) {
  const [corrected, setCorrected] = useState(false);
  const isOutOfRange =
    field.fieldType === "NUMBER" &&
    field.minValue != null &&
    field.maxValue != null &&
    value !== "" &&
    !isNaN(Number(value)) &&
    (Number(value) < field.minValue || Number(value) > field.maxValue);

  function handleChange(newValue: string) {
    if (measurement?.ocrRawValue && newValue !== measurement.ocrRawValue) {
      setCorrected(true);
    }
    onChange(newValue);
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${
        isOutOfRange ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      {/* Labels */}
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{field.labelEn}</Label>
        <p className="text-xs text-gray-400">{field.labelHi}</p>
        <div className="flex items-center gap-2 mt-1">
          {field.unit && (
            <span className="text-xs text-gray-500">Unit: {field.unit}</span>
          )}
          {field.minValue != null && field.maxValue != null && (
            <span className="text-xs text-gray-400">
              Range: [{field.minValue}–{field.maxValue}]
            </span>
          )}
          {field.required && (
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="w-48">
        {field.fieldType === "BOOLEAN" ? (
          <div className="flex items-center gap-2">
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) => handleChange(String(checked))}
            />
            <span className="text-sm">{value === "true" ? "Yes" : "No"}</span>
          </div>
        ) : field.fieldType === "SELECT" && options ? (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.split(",").map((opt) => (
                <SelectItem key={opt.trim()} value={opt.trim()}>
                  {opt.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={field.fieldType === "NUMBER" ? "number" : "text"}
            step={field.fieldType === "NUMBER" ? "any" : undefined}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={`h-9 ${isOutOfRange ? "border-red-400" : ""}`}
          />
        )}

        {/* OCR info row */}
        <div className="flex items-center gap-2 mt-1">
          {getConfidenceBadge(measurement?.ocrConfidence)}
          {corrected && (
            <Badge variant="outline" className="text-xs bg-yellow-50">
              Corrected
            </Badge>
          )}
          {isOutOfRange && (
            <span className="text-xs text-red-600 font-medium">
              Out of range!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
