import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

/**
 * Generate a batch code in format: DOK-YYYYMMDD-XX-NNN
 * where XX is the product code and NNN is a sequential number for the day.
 */
export async function generateBatchCode(productCode: string): Promise<string> {
  const today = format(new Date(), "yyyyMMdd");
  const prefix = `DOK-${today}-${productCode}-`;

  // Count existing batches with this prefix today
  const count = await prisma.batch.count({
    where: {
      batchCode: { startsWith: prefix },
    },
  });

  const seq = String(count + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}
