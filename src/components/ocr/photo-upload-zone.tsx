"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2, ScanLine } from "lucide-react";

interface PhotoUploadZoneProps {
  batchId: string;
  stageId: string;
  stageRecordId: string;
  existingPhotos: string[];
  onUploadComplete: () => void;
}

interface UploadProgress {
  total: number;
  uploaded: number;
  isUploading: boolean;
}

export function PhotoUploadZone({
  batchId,
  stageId,
  stageRecordId,
  existingPhotos,
  onUploadComplete,
}: PhotoUploadZoneProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(existingPhotos);
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    uploaded: 0,
    isUploading: false,
  });
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setProgress({ total: pendingFiles.length, uploaded: 0, isUploading: true });

    try {
      const formData = new FormData();
      formData.append("batchId", batchId);
      formData.append("stageId", stageId);

      for (const file of pendingFiles) {
        formData.append("file", file);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedPhotos(data.uploadedUrls ? [...uploadedPhotos, ...data.uploadedUrls] : uploadedPhotos);
      setPendingFiles([]);
      setProgress({ total: 0, uploaded: 0, isUploading: false });
      toast.success(`${pendingFiles.length} photo(s) uploaded successfully`);
      onUploadComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      setProgress({ total: 0, uploaded: 0, isUploading: false });
    }
  };

  const handleProcessOcr = async () => {
    setIsProcessingOcr(true);

    try {
      const response = await fetch("/api/ocr/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, stageRecordId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "OCR processing failed");
      }

      const data = await response.json();
      toast.success(
        `OCR complete: ${data.measurementCount} fields extracted (avg confidence: ${Math.round(data.avgConfidence * 100)}%)`
      );
      onUploadComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "OCR processing failed";
      toast.error(message);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const allPhotos = [...uploadedPhotos];

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        {isDragActive ? (
          <p className="text-sm text-blue-600 font-medium">Drop photos here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Drag & drop QC form photos here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP, or HEIC up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* Pending files list */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Ready to upload ({pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pendingFiles.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="relative">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePendingFile(index);
                      }}
                      className="ml-auto shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={progress.isUploading}
            className="w-full"
          >
            {progress.isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {pendingFiles.length} Photo{pendingFiles.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Uploaded photos preview */}
      {allPhotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Photos ({allPhotos.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allPhotos.map((url, index) => (
              <Card key={`photo-${index}`} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`QC form photo ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Process OCR button */}
      {pendingFiles.length === 0 && allPhotos.length > 0 && (
        <Button
          onClick={handleProcessOcr}
          disabled={isProcessingOcr}
          variant="secondary"
          className="w-full"
        >
          {isProcessingOcr ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing OCR...
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" />
              Process OCR
            </>
          )}
        </Button>
      )}
    </div>
  );
}
