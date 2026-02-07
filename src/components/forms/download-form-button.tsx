"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DownloadFormButton({
  batchId,
  stageIndex,
  label = "Download Form",
  size = "sm",
}: {
  batchId: string;
  stageIndex?: number;
  label?: string;
  size?: "sm" | "default";
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/forms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, stageIndex }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ??
        "form.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Form downloaded.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download form."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" size={size} onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      ) : (
        <Download className="mr-1 h-3 w-3" />
      )}
      {label}
    </Button>
  );
}
