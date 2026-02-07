interface FieldValue {
  fieldId: string;
  name: string;
  labelEn: string;
  fieldType: string;
  value: string;
  minValue: number | null;
  maxValue: number | null;
}

interface GateResult {
  passed: boolean;
  failures: Array<{
    fieldId: string;
    fieldName: string;
    reason: string;
  }>;
}

/**
 * Evaluate a QC gate based on boolean pass/fail fields and numeric ranges.
 */
export function evaluateQcGate(fieldValues: FieldValue[]): GateResult {
  const failures: GateResult["failures"] = [];

  for (const fv of fieldValues) {
    // Boolean fields: false = failure
    if (fv.fieldType === "BOOLEAN" && fv.value === "false") {
      failures.push({
        fieldId: fv.fieldId,
        fieldName: fv.labelEn,
        reason: `${fv.labelEn} failed (marked No)`,
      });
    }

    // Number fields: check ranges
    if (
      fv.fieldType === "NUMBER" &&
      fv.minValue != null &&
      fv.maxValue != null &&
      fv.value !== ""
    ) {
      const numVal = parseFloat(fv.value);
      if (!isNaN(numVal) && (numVal < fv.minValue || numVal > fv.maxValue)) {
        failures.push({
          fieldId: fv.fieldId,
          fieldName: fv.labelEn,
          reason: `${fv.labelEn}: ${fv.value} outside [${fv.minValue}–${fv.maxValue}]`,
        });
      }
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
