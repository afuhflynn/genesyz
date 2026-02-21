"use client";

import { ChevronUp, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDefaultPeriod,
  getMetricFormat,
  METRIC_CATEGORIES,
  METRIC_PERIODS,
} from "@/lib/constants/metrics";
import type {
  AdditionalMetricInput,
  MetricFormat,
  MetricPeriod,
} from "@/lib/validators/startup";
import { MetricValueInput } from "./MetricValueInput";

interface AdditionalMetricWithId extends AdditionalMetricInput {
  _id: string;
}

interface AdditionalMetricsSectionProps {
  value: AdditionalMetricInput[];
  onChange: (metrics: AdditionalMetricInput[]) => void;
  primaryMetricType: string;
}

export function AdditionalMetricsSection({
  value,
  onChange,
  primaryMetricType,
}: AdditionalMetricsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metricsWithIds, setMetricsWithIds] = useState<
    AdditionalMetricWithId[]
  >(() => (value || []).map((m) => ({ ...m, _id: nanoid() })));

  const syncChange = (updated: AdditionalMetricWithId[]) => {
    setMetricsWithIds(updated);
    onChange(updated.map(({ _id, ...rest }) => rest));
  };

  const addMetric = () => {
    if (metricsWithIds.length >= 5) return;
    const newMetric: AdditionalMetricWithId = {
      _id: nanoid(),
      type: "USER_CONVERSATIONS",
      value: 0,
      period: "WEEKLY",
      customMetricName: null,
    };
    syncChange([...metricsWithIds, newMetric]);
  };

  const removeMetric = (id: string) => {
    syncChange(metricsWithIds.filter((m) => m._id !== id));
  };

  const updateMetric = (
    id: string,
    updates: Partial<AdditionalMetricInput>,
  ) => {
    syncChange(
      metricsWithIds.map((m) => (m._id === id ? { ...m, ...updates } : m)),
    );
  };

  const availableMetrics = METRIC_CATEGORIES.flatMap(
    (cat) => cat.metrics,
  ).filter((m) => m.value !== primaryMetricType);

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Additional Metrics
        {metricsWithIds.length > 0 && (
          <span className="ml-2 text-muted-foreground">
            ({metricsWithIds.length} added)
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Additional Metrics</CardTitle>
            <CardDescription>
              Track more metrics (optional, max 5)
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricsWithIds.map((metric) => {
          const format = getMetricFormat(metric.type) as MetricFormat;
          const isCustom = metric.type === "CUSTOM";

          return (
            <div key={metric._id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Metric</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(metric._id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={metric.type}
                    onValueChange={(val) => {
                      const newFormat = getMetricFormat(val) as MetricFormat;
                      const defaultPeriod = getDefaultPeriod(
                        val,
                      ) as MetricPeriod;
                      updateMetric(metric._id, {
                        type: val as AdditionalMetricInput["type"],
                        period: defaultPeriod,
                        value: newFormat === "PERCENTAGE" ? 0 : metric.value,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {METRIC_CATEGORIES.map((category) => {
                        const categoryMetrics = category.metrics.filter(
                          (m) =>
                            m.value !== primaryMetricType &&
                            (m.value === metric.type ||
                              !metricsWithIds.some(
                                (v) =>
                                  v._id !== metric._id && v.type === m.value,
                              )),
                        );
                        if (categoryMetrics.length === 0) return null;
                        return (
                          <div key={category.name}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {category.name}
                            </div>
                            {categoryMetrics.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={metric.period || "WEEKLY"}
                    onValueChange={(val) =>
                      updateMetric(metric._id, { period: val as MetricPeriod })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METRIC_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <MetricValueInput
                    value={metric.value}
                    onChange={(val) => updateMetric(metric._id, { value: val })}
                    format={format}
                  />
                </div>
              </div>

              {isCustom && (
                <div className="space-y-2">
                  <Label>Custom Metric Name</Label>
                  <Input
                    value={metric.customMetricName || ""}
                    onChange={(e) =>
                      updateMetric(metric._id, {
                        customMetricName: e.target.value,
                      })
                    }
                    placeholder="e.g., Newsletter Opens"
                  />
                </div>
              )}
            </div>
          );
        })}

        {metricsWithIds.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMetric}
            disabled={availableMetrics.length === 0}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Metric ({metricsWithIds.length}/5)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
