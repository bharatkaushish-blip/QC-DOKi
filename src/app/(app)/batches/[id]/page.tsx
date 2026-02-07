import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Truck } from "lucide-react";
import { format } from "date-fns";
import { getBatchWithDetails } from "@/actions/batch-actions";
import { BatchStatusBadge } from "@/components/batches/batch-status-badge";
import { BatchStatusActions } from "@/components/batches/batch-status-actions";
import { BatchTimeline } from "@/components/batches/batch-timeline";
import { Button } from "@/components/ui/button";
import { Upload, ClipboardCheck } from "lucide-react";

export default async function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const batch = await getBatchWithDetails(params.id);

  if (!batch) {
    notFound();
  }

  const totalStages = batch.stageRecords.length;
  const completedStages = batch.stageRecords.filter(
    (sr) => sr.committedAt
  ).length;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/batches"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Batches
        </Link>
      </div>

      <PageHeader
        title={batch.batchCode}
        description={
          <span className="flex items-center gap-2">
            <BatchStatusBadge status={batch.status} />
            <Badge variant="outline">{batch.product.name}</Badge>
            <Badge variant="secondary">{batch.flavour.name}</Badge>
          </span>
        }
      >
        <BatchStatusActions batchId={batch.id} currentStatus={batch.status} />
      </PageHeader>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium">
                {format(new Date(batch.createdAt), "dd MMM yyyy HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Created By</p>
              <p className="text-sm font-medium">{batch.createdBy.name}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Truck className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Supplier</p>
              <p className="text-sm font-medium">
                {batch.supplier?.name ?? "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">
                {completedStages}/{totalStages}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Stages Completed</p>
              <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{
                    width: `${totalStages > 0 ? (completedStages / totalStages) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <Link href={`/batches/${batch.id}/upload`}>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Form Photos
          </Button>
        </Link>
        <Link href={`/batches/${batch.id}/validate`}>
          <Button variant="outline" size="sm">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Validate Data
          </Button>
        </Link>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchTimeline stageRecords={batch.stageRecords} batchId={batch.id} />
        </CardContent>
      </Card>

      {/* Notes */}
      {batch.notes && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{batch.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
