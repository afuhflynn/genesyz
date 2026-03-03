"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWeeklyUpdate } from "@/hooks";

const PRIORITY_OPTIONS = [
  { value: 1, label: "Priority 1" },
  { value: 2, label: "Priority 2" },
  { value: 3, label: "Priority 3" },
];

const METRIC_TYPES = [
  "USERS",
  "DAU",
  "WAU",
  "MAU",
  "RETENTION_RATE",
  "CHURN_RATE",
  "MRR",
  "ARR",
  "GROSS_REVENUE",
  "NET_REVENUE",
  "TAKE_RATE",
  "TRAFFIC",
  "PAGE_VIEWS",
  "SESSION_DURATION",
  "CONVERSION_RATE",
  "LEADS",
  "CUSTOM",
];

const METRIC_PERIODS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const editUpdateSchema = z.object({
  isLaunched: z.boolean(),
  weeksToLaunch: z.number().int().min(0).optional().nullable(),
  usersTalkedTo: z.number().int().min(0),
  userLearnings: z
    .string()
    .min(10, "Please share at least 10 characters")
    .max(5000),
  primaryMetricType: z.string(),
  primaryMetricValue: z.number().min(0),
  metricPeriod: z.string().optional().nullable(),
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

type EditUpdateFormValues = z.infer<typeof editUpdateSchema>;

interface PreviousGoal {
  content: string;
  completed: boolean;
}

interface EditWeeklyUpdateProps {
  startupId: string;
  startupSlug: string;
  startupName: string;
  update: {
    id: string;
    weekNumber: number;
    isLaunched: boolean;
    weeksToLaunch: number | null;
    usersTalkedTo: number;
    userLearnings: string;
    primaryMetricType: string;
    primaryMetricValue: number;
    metricPeriod: string | null;
    customMetricName: string | null;
    moraleScore: number;
    topImprovements: string;
    biggestObstacle: string;
    editableUntil: Date | null;
    isLocked: boolean;
    goals: Array<{
      id: string;
      content: string;
      priority: number;
      completed: boolean;
    }>;
  };
  previousGoals: PreviousGoal[];
}

export function EditWeeklyUpdate({
  startupId,
  startupSlug,
  startupName,
  update,
}: EditWeeklyUpdateProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateWeeklyUpdate();

  const form = useForm<EditUpdateFormValues>({
    resolver: zodResolver(editUpdateSchema),
    defaultValues: {
      isLaunched: update.isLaunched,
      weeksToLaunch: update.weeksToLaunch,
      usersTalkedTo: update.usersTalkedTo,
      userLearnings: update.userLearnings,
      primaryMetricType: update.primaryMetricType,
      primaryMetricValue: update.primaryMetricValue,
      metricPeriod: update.metricPeriod || "WEEKLY",
      customMetricName: update.customMetricName,
      moraleScore: update.moraleScore,
      topImprovements: update.topImprovements || "",
      biggestObstacle: update.biggestObstacle || "",
      goals: update.goals.map((g) => ({
        content: g.content,
        priority: g.priority,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  const isLaunched = form.watch("isLaunched");
  const selectedMetricType = form.watch("primaryMetricType");

  async function onSubmit(data: EditUpdateFormValues) {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        startupId,
        updateId: update.id,
        data,
      });
      router.push(`/startups/${startupSlug}/updates`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${startupSlug}/updates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Week {update.weekNumber} Update
          </h1>
          <p className="text-muted-foreground">{startupName}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Launch Status */}
          <Card>
            <CardHeader>
              <CardTitle>Launch Status</CardTitle>
              <CardDescription>
                Has your startup launched publicly?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isLaunched"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        We have launched
                      </FormLabel>
                      <FormDescription>
                        Toggle to yes once you have users/paying customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isLaunched && (
                <FormField
                  control={form.control}
                  name="weeksToLaunch"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Weeks since launch</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>
                How many users have you talked to this week?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="usersTalkedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users talked to</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
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
                  <FormItem className="mt-4">
                    <FormLabel>What did you learn?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what you learned from talking to users..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Primary Metric */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Metric</CardTitle>
              <CardDescription>Track your key metric over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="primaryMetricType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {METRIC_TYPES.map((metric) => (
                            <SelectItem key={metric} value={metric}>
                              {metric.replace(/_/g, " ")}
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
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="metricPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric period</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "WEEKLY"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
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

                {selectedMetricType === "CUSTOM" && (
                  <FormField
                    control={form.control}
                    name="customMetricName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom metric name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., API Calls"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Morale */}
          <Card>
            <CardHeader>
              <CardTitle>Team Morale</CardTitle>
              <CardDescription>
                How is the team feeling this week?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="moraleScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morale score (1-10)</FormLabel>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          className="w-20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <Button
                            key={score}
                            type="button"
                            variant={
                              field.value === score ? "default" : "outline"
                            }
                            size="sm"
                            className="w-8"
                            onClick={() => field.onChange(score)}
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Next Week Goals</CardTitle>
              <CardDescription>
                Set up to 3 goals for next week (prioritize your top 3)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`goals.${index}.content`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={`Goal ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`goals.${index}.priority`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
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
                  onClick={() =>
                    append({
                      content: "",
                      priority: fields.length + 1,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Reflections */}
          <Card>
            <CardHeader>
              <CardTitle>Reflections</CardTitle>
              <CardDescription>
                Reflect on what happened this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="topImprovements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What improved your metric?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What actions led to metric improvement?"
                        {...field}
                        value={field.value || ""}
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
                    <FormLabel>Biggest obstacle</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What was your biggest challenge?"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href={`/startups/${startupSlug}/updates`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
