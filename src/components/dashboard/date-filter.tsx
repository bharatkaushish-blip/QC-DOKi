"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DATE_PRESETS } from "@/lib/constants";
import { CalendarDays } from "lucide-react";

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = searchParams.get("preset") || "";
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";

  function setPreset(value: string) {
    const params = new URLSearchParams();
    params.set("preset", value);
    router.push(`/dashboard?${params.toString()}`);
  }

  function handleCustomRange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;
    if (from && to) {
      const params = new URLSearchParams();
      params.set("from", from);
      params.set("to", to);
      router.push(`/dashboard?${params.toString()}`);
    }
  }

  function clearFilter() {
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4" />
            <span className="font-medium">Period:</span>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={currentPreset === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(preset.value)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block" />

          {/* Custom range */}
          <form
            onSubmit={handleCustomRange}
            className="flex items-end gap-2"
          >
            <div>
              <Label htmlFor="from" className="text-xs text-gray-500">
                From
              </Label>
              <Input
                type="date"
                id="from"
                name="from"
                defaultValue={currentFrom}
                className="h-8 text-xs w-[130px]"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs text-gray-500">
                To
              </Label>
              <Input
                type="date"
                id="to"
                name="to"
                defaultValue={currentTo}
                className="h-8 text-xs w-[130px]"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="text-xs">
              Apply
            </Button>
          </form>

          {(currentPreset || currentFrom) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="text-xs text-gray-500"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
