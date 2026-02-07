"use client";

import { useState, useTransition } from "react";
import { submitQcApproval } from "@/actions/qc-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Disposition } from "@prisma/client";

interface QcApprovalFormProps {
  batchId: string;
  stageRecordId: string;
}

export function QcApprovalForm({ batchId, stageRecordId }: QcApprovalFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [approverName, setApproverName] = useState("");
  const [tastePassed, setTastePassed] = useState(true);
  const [tasteNotes, setTasteNotes] = useState("");
  const [texturePassed, setTexturePassed] = useState(true);
  const [textureNotes, setTextureNotes] = useState("");
  const [smellPassed, setSmellPassed] = useState(true);
  const [smellNotes, setSmellNotes] = useState("");
  const [visualPassed, setVisualPassed] = useState(true);
  const [visualNotes, setVisualNotes] = useState("");
  const [waterActivity, setWaterActivity] = useState("");
  const [phLevel, setPhLevel] = useState("");
  const [disposition, setDisposition] = useState<Disposition>("PROCEED");

  const allPassed = tastePassed && texturePassed && smellPassed && visualPassed;

  function handleSubmit(result: "APPROVED" | "REJECTED") {
    if (!approverName.trim()) {
      toast.error("Approver name is required.");
      return;
    }

    startTransition(async () => {
      const res = await submitQcApproval({
        batchId,
        stageRecordId,
        approverName: approverName.trim(),
        result,
        tastePassed,
        tasteNotes: tasteNotes || undefined,
        texturePassed,
        textureNotes: textureNotes || undefined,
        smellPassed,
        smellNotes: smellNotes || undefined,
        visualPassed,
        visualNotes: visualNotes || undefined,
        waterActivity: waterActivity ? parseFloat(waterActivity) : undefined,
        phLevel: phLevel ? parseFloat(phLevel) : undefined,
        disposition,
      });

      if ("error" in res) {
        toast.error(res.error as string);
        return;
      }

      toast.success(`QC ${result.toLowerCase()}.`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          Submit QC Approval
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>QC Gate Approval</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approverName">Approver Name *</Label>
            <Input
              id="approverName"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Sensory Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Taste Test Pass</Label>
                <Switch checked={tastePassed} onCheckedChange={setTastePassed} />
              </div>
              {!tastePassed && (
                <Textarea
                  placeholder="Taste notes..."
                  value={tasteNotes}
                  onChange={(e) => setTasteNotes(e.target.value)}
                  rows={2}
                />
              )}

              <div className="flex items-center justify-between">
                <Label>Texture Test Pass</Label>
                <Switch checked={texturePassed} onCheckedChange={setTexturePassed} />
              </div>
              {!texturePassed && (
                <Textarea
                  placeholder="Texture notes..."
                  value={textureNotes}
                  onChange={(e) => setTextureNotes(e.target.value)}
                  rows={2}
                />
              )}

              <div className="flex items-center justify-between">
                <Label>Smell Test Pass</Label>
                <Switch checked={smellPassed} onCheckedChange={setSmellPassed} />
              </div>
              {!smellPassed && (
                <Textarea
                  placeholder="Smell notes..."
                  value={smellNotes}
                  onChange={(e) => setSmellNotes(e.target.value)}
                  rows={2}
                />
              )}

              <div className="flex items-center justify-between">
                <Label>Visual Inspection Pass</Label>
                <Switch checked={visualPassed} onCheckedChange={setVisualPassed} />
              </div>
              {!visualPassed && (
                <Textarea
                  placeholder="Visual notes..."
                  value={visualNotes}
                  onChange={(e) => setVisualNotes(e.target.value)}
                  rows={2}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="waterActivity">Water Activity (Aw)</Label>
              <Input
                id="waterActivity"
                type="number"
                step="0.01"
                value={waterActivity}
                onChange={(e) => setWaterActivity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phLevel">pH Level</Label>
              <Input
                id="phLevel"
                type="number"
                step="0.1"
                value={phLevel}
                onChange={(e) => setPhLevel(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Disposition</Label>
            <Select
              value={disposition}
              onValueChange={(v) => setDisposition(v as Disposition)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROCEED">Proceed</SelectItem>
                <SelectItem value="REWORK">Rework</SelectItem>
                <SelectItem value="HOLD">Hold</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            {!allPassed && (
              <Button
                variant="destructive"
                onClick={() => handleSubmit("REJECTED")}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            )}
            <Button
              onClick={() => handleSubmit(allPassed ? "APPROVED" : "REJECTED")}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {allPassed ? "Approve" : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
