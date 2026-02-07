import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBatchWithDetails } from "@/actions/batch-actions";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { BatchStatusBadge } from "@/components/batches/batch-status-badge";
import { UploadStageSelector } from "./upload-stage-selector";

export default async function BatchUploadPage({
  params,
}: {
  params: { id: string };
}) {
  const batch = await getBatchWithDetails(params.id);

  if (!batch) {
    notFound();
  }

  const stages = batch.stageRecords.map((sr) => ({
    stageRecordId: sr.id,
    stageId: sr.stageId,
    stageName: sr.stage.name,
    stageOrder: sr.stage.order,
    isQcGate: sr.stage.isQcGate,
    formPhotoUrls: sr.formPhotoUrls,
    ocrStatus: sr.ocrStatus,
    ocrConfidenceAvg: sr.ocrConfidenceAvg,
  }));

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/batches/${batch.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Batch
        </Link>
      </div>

      <PageHeader
        title={`Upload Photos - ${batch.batchCode}`}
        description={
          <span className="flex items-center gap-2">
            <BatchStatusBadge status={batch.status} />
            <Badge variant="outline">{batch.product.name}</Badge>
            <Badge variant="secondary">{batch.flavour.name}</Badge>
          </span>
        }
      />

      <UploadStageSelector batchId={batch.id} stages={stages} />
    </div>
  );
}
