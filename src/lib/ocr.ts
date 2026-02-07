import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface FieldDefinition {
  fieldId: string;
  name: string;
  labelEn: string;
  fieldType: string;
  unit?: string;
}

interface OcrResult {
  fieldId: string;
  rawValue: string;
  confidence: number;
}

export async function extractFormData(
  imageUrl: string,
  fields: FieldDefinition[]
): Promise<OcrResult[]> {
  const fieldDescriptions = fields
    .map((f) => {
      const unitPart = f.unit ? ` (unit: ${f.unit})` : "";
      return `- fieldId: "${f.fieldId}", label: "${f.labelEn}", type: ${f.fieldType}${unitPart}`;
    })
    .join("\n");

  const systemPrompt = `You are an OCR assistant specialized in reading handwritten QC (Quality Control) forms for food manufacturing. Your task is to extract field values from a photographed form.

Instructions:
1. Examine the image of a handwritten QC form carefully.
2. For each field listed below, find the corresponding value written on the form.
3. Return a JSON array of objects with fieldId, rawValue (the text/number you read), and confidence (0.0 to 1.0 indicating how confident you are in the reading).
4. If a field is empty or illegible, set rawValue to "" and confidence to 0.
5. For NUMBER fields, extract only the numeric value (no units).
6. For BOOLEAN fields, interpret checkmarks, "yes"/"no", ticks/crosses as "true" or "false".
7. For SELECT fields, extract the selected option text exactly as written.
8. For DATETIME fields, extract the date/time as written.

Fields to extract:
${fieldDescriptions}

Respond ONLY with a valid JSON array. No markdown, no code fences, no explanation.
Example: [{"fieldId":"abc123","rawValue":"42.5","confidence":0.95}]`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the handwritten values from this QC form photo for the fields listed in your instructions.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OCR returned empty response");
  }

  // Parse the JSON response, stripping potential markdown fences
  const cleaned = content.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  const parsed: OcrResult[] = JSON.parse(cleaned);

  // Validate and normalize the results
  const validFieldIds = new Set(fields.map((f) => f.fieldId));

  return parsed
    .filter((r) => validFieldIds.has(r.fieldId))
    .map((r) => ({
      fieldId: r.fieldId,
      rawValue: String(r.rawValue ?? ""),
      confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
    }));
}
