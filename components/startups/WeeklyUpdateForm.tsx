"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWeeklyUpdate } from "@/hooks";
import {
  getDefaultPeriod,
  getMetricFormat,
  LAUNCHED_ONLY_METRICS,
  METRIC_CATEGORIES,
  METRIC_PERIODS,
} from "@/lib/constants/metrics";
import {
  type AdditionalMetricInput,
  type PreviousGoalReviewInput,
  primaryMetricTypeSchema,
} from "@/lib/validators/startup";
import { AdditionalMetricsSection } from "./AdditionalMetricsSection";
import { MetricValueInput } from "./MetricValueInput";
import { PreviousGoalsReview } from "./PreviousGoalsReview";

const weeklyUpdateSchema = z.object({
  isLaunched: z.boolean(),
  weeksToLaunch: z.number().int().min(0).optional().nullable(),
  usersTalkedTo: z.number().int().min(0),
  userLearnings: z
    .string()
    .min(10, "Please share at least 10 characters")
    .max(5000),
  primaryMetricType: primaryMetricTypeSchema,
  primaryMetricValue: z.number().min(0),
  metricPeriod: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"])
    .optional()
    .nullable(),
  customMetricName: z.string().max(100).optional().nullable(),
  moraleScore: z.number().int().min(1).max(10),
  topImprovements: z.string().max(5000).optional(),
  biggestObstacle: z.string().max(5000).optional(),
  goals: z
    .array(
      z.object({
        content: z.string().min(1, "Goal cannot be empty").max(500),
        priority: z.number().int().min(1).max(3),
      }),
    )
    .min(1, "Add at least 1 goal")
    .max(3, "Maximum 3 goals allowed"),
});

type WeeklyUpdateFormValues = z.infer<typeof weeklyUpdateSchema>;

const MORALE_LABELS: Record<number, string> = {
  1: "Totally burned out",
  2: "Very low",
  3: "Struggling",
  4: "Below average",
  5: "Neutral",
  6: "Above average",
  7: "Good",
  8: "Optimistic",
  9: "Very excited",
  10: "Extremely excited and optimistic",
};

interface WeeklyUpdateFormProps {
  startupId: string;
  startupName: string;
  currentWeekNumber: number;
  isLaunched: boolean;
  currentPrimaryMetric: string;
  previousGoals?: string[];
  onSuccess?: () => void;
}

export function WeeklyUpdateForm({
  startupId,
  startupName,
  currentWeekNumber,
  isLaunched: initialIsLaunched,
  currentPrimaryMetric,
  previousGoals = [],
  onSuccess,
}: WeeklyUpdateFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [additionalMetrics, setAdditionalMetrics] = useState<
    AdditionalMetricInput[]
  >([]);
  const [previousGoalsReview, setPreviousGoalsReview] = useState<
    PreviousGoalReviewInput[]
  >([]);
  const [goalsCompletionRate, setGoalsCompletionRate] = useState<number>(0);
  const mutation = useCreateWeeklyUpdate();

  const form = useForm<WeeklyUpdateFormValues>({
    resolver: zodResolver(weeklyUpdateSchema),
    defaultValues: {
      isLaunched: initialIsLaunched,
      weeksToLaunch: null,
      usersTalkedTo: 0,
      userLearnings: "",
      primaryMetricType: initialIsLaunched
        ? (currentPrimaryMetric as WeeklyUpdateFormValues["primaryMetricType"]) ||
          "MRR"
        : "USER_CONVERSATIONS",
      primaryMetricValue: 0,
      metricPeriod: getDefaultPeriod(
        initialIsLaunched
          ? currentPrimaryMetric || "MRR"
          : "USER_CONVERSATIONS",
      ) as WeeklyUpdateFormValues["metricPeriod"],
      customMetricName: null,
      moraleScore: 5,
      topImprovements: "",
      biggestObstacle: "",
      goals: [{ content: "", priority: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  const isLaunched = form.watch("isLaunched");
  const moraleScore = form.watch("moraleScore");
  const primaryMetricType = form.watch("primaryMetricType");

  useEffect(() => {
    if (isLaunched) {
      const defaultPeriod = getDefaultPeriod(primaryMetricType);
      form.setValue(
        "metricPeriod",
        defaultPeriod as WeeklyUpdateFormValues["metricPeriod"],
      );
    }
  }, [primaryMetricType, isLaunched, form]);

  useEffect(() => {
    if (!isLaunched) {
      form.setValue("primaryMetricType", "USER_CONVERSATIONS");
    }
  }, [isLaunched, form]);

  const onSubmit = (data: WeeklyUpdateFormValues) => {
    const metricFormat = getMetricFormat(data.primaryMetricType);

    mutation.mutate(
      {
        startupId,
        data: {
          ...data,
          weeksToLaunch: data.isLaunched ? null : data.weeksToLaunch,
          metricFormat: metricFormat as "CURRENCY" | "PERCENTAGE" | "NUMBER",
          additionalMetrics:
            additionalMetrics.length > 0 ? additionalMetrics : null,
          previousGoalsReview:
            previousGoalsReview.length > 0 ? previousGoalsReview : null,
          goalsCompletionRate:
            previousGoalsReview.length > 0 ? goalsCompletionRate : null,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSuccess?.();
        },
      },
    );
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            Week {currentWeekNumber} Update Submitted!
          </h3>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Your weekly progress has been recorded. AI analysis will be
            generated shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricFormat = getMetricFormat(primaryMetricType);
  const isCustomMetric = primaryMetricType === "CUSTOM";

  const getFilteredMetricCategories = () => {
    if (isLaunched) {
      return METRIC_CATEGORIES;
    }
    return METRIC_CATEGORIES.filter((cat) => cat.name === "Special Cases").map(
      (cat) => ({
        ...cat,
        metrics: cat.metrics.filter((m) => m.value === "USER_CONVERSATIONS"),
      }),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Launch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isLaunched" className="text-base font-medium">
                  Are you launched?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toggle this when your startup is live
                </p>
              </div>
              <FormField
                control={form.control}
                name="isLaunched"
                render={({ field }) => (
                  <FormControl>
                    <Switch
                      id="isLaunched"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                )}
              />
            </div>

            {isLaunched ? (
              <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-center">
                <PartyPopper className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
                <p className="mt-2 font-medium text-green-900 dark:text-green-100">
                  Woohoo! Huge congrats on launching!
                </p>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="weeksToLaunch"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Weeks to Launch</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g., 4"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      How many weeks until you plan to launch?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {previousGoals.length > 0 && (
          <PreviousGoalsReview
            previousGoals={previousGoals}
            value={previousGoalsReview}
            onChange={setPreviousGoalsReview}
            onCompletionRateChange={setGoalsCompletionRate}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Conversations</CardTitle>
            <CardDescription>
              Track your customer discovery progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="usersTalkedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Users/prospective users talked to in the last week? *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userLearnings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What have you learned from them? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key insights from your conversations..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {isLaunched && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Metric</CardTitle>
              <CardDescription>
                Choose one metric to focus on this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="primaryMetricType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose your primary metric *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getFilteredMetricCategories().map((category) => (
                            <div key={category.name}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {category.name}
                              </div>
                              {category.metrics.map((metric) => (
                                <SelectItem
                                  key={metric.value}
                                  value={metric.value}
                                >
                                  {metric.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metricPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "WEEKLY"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {METRIC_PERIODS.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryMetricValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value *</FormLabel>
                      <FormControl>
                        <MetricValueInput
                          value={field.value}
                          onChange={field.onChange}
                          format={
                            metricFormat as "CURRENCY" | "PERCENTAGE" | "NUMBER"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCustomMetric && (
                <FormField
                  control={form.control}
                  name="customMetricName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Metric Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Newsletter Open Rate"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )}

        {isLaunched && (
          <AdditionalMetricsSection
            value={additionalMetrics}
            onChange={setAdditionalMetrics}
            primaryMetricType={primaryMetricType}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goals for Next Week</CardTitle>
            <CardDescription>
              Set 1-3 goals you want to accomplish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex h-10 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <FormField
                  control={form.control}
                  name={`goals.${index}.content`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Goal ${index + 1}...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {fields.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ content: "", priority: fields.length + 1 })
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            )}
            {form.formState.errors.goals && (
              <p className="text-sm text-destructive">
                {form.formState.errors.goals.message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Morale & Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="moraleScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling? (1-10)</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MORALE_LABELS).map(([score, label]) => (
                        <SelectItem key={score} value={score}>
                          {score} - {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        moraleScore <= 3
                          ? "bg-red-500"
                          : moraleScore <= 6
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    {MORALE_LABELS[moraleScore]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topImprovements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What most improved your primary metric?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What actions moved the needle..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="biggestObstacle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biggest obstacle?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's blocking your progress..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" disabled={mutation.isPending}>
            Save Draft
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Week {currentWeekNumber} Update
          </Button>
        </div>
      </form>
    </Form>
  );
}
