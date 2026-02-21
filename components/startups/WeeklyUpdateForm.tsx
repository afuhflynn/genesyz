"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper, Plus, Trash2 } from "lucide-react";
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

const weeklyUpdateSchema = z.object({
  isLaunched: z.boolean(),
  weeksToLaunch: z.number().int().min(0).optional().nullable(),
  usersTalkedTo: z.number().int().min(0),
  userLearnings: z
    .string()
    .min(10, "Please share at least 10 characters")
    .max(5000),
  primaryMetricType: z.enum([
    "ARR",
    "MRR",
    "SOFTWARE_SALES",
    "HARDWARE_SALES",
    "PREORDER_SALES",
    "LETTERS_OF_INTENT",
    "PAID_TRIALS",
    "PAID_CONTRACTS",
    "ECOMMERCE_SALES",
    "MARKETPLACE_VOLUME",
    "TRANSACTION_VOLUME",
    "ASSETS_UNDER_MANAGEMENT",
    "DAU",
    "WAU",
    "MAU",
    "WAITLIST_SIGNUPS",
    "USER_CONVERSATIONS",
  ]),
  primaryMetricValue: z.number().min(0),
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

const PRIMARY_METRIC_GROUPS = {
  "Recurring Revenue (USD)": [
    { value: "ARR", label: "Annual Recurring Revenue" },
    { value: "MRR", label: "Monthly Recurring Revenue" },
  ],
  "Revenue (USD)": [
    { value: "SOFTWARE_SALES", label: "Software Sales" },
    { value: "HARDWARE_SALES", label: "Hardware Sales" },
    { value: "PREORDER_SALES", label: "Preorder Sales" },
    { value: "LETTERS_OF_INTENT", label: "Letters of Intent" },
    { value: "PAID_TRIALS", label: "Paid Trials" },
    { value: "PAID_CONTRACTS", label: "Paid Contracts" },
    { value: "ECOMMERCE_SALES", label: "Ecommerce Sales" },
    { value: "MARKETPLACE_VOLUME", label: "Marketplace Transaction Volume" },
    { value: "TRANSACTION_VOLUME", label: "Transaction Volume (other)" },
    { value: "ASSETS_UNDER_MANAGEMENT", label: "Assets Under Management" },
  ],
  Engagement: [
    { value: "DAU", label: "Daily Active Users (DAU)" },
    { value: "WAU", label: "Weekly Active Users (WAU)" },
    { value: "MAU", label: "Monthly Active Users (MAU)" },
  ],
  "Pre-Launch": [
    { value: "USER_CONVERSATIONS", label: "User Conversations" },
    { value: "WAITLIST_SIGNUPS", label: "Waitlist Signups" },
  ],
};

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
  onSuccess?: () => void;
}

export function WeeklyUpdateForm({
  startupId,
  startupName,
  currentWeekNumber,
  isLaunched: initialIsLaunched,
  currentPrimaryMetric,
  onSuccess,
}: WeeklyUpdateFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const mutation = useCreateWeeklyUpdate();

  const form = useForm<WeeklyUpdateFormValues>({
    resolver: zodResolver(weeklyUpdateSchema),
    defaultValues: {
      isLaunched: initialIsLaunched,
      weeksToLaunch: null,
      usersTalkedTo: 0,
      userLearnings: "",
      primaryMetricType:
        (currentPrimaryMetric as WeeklyUpdateFormValues["primaryMetricType"]) ||
        "USER_CONVERSATIONS",
      primaryMetricValue: 0,
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

  const onSubmit = (data: WeeklyUpdateFormValues) => {
    mutation.mutate(
      {
        startupId,
        data: {
          ...data,
          weeksToLaunch: data.isLaunched ? null : data.weeksToLaunch,
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
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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
          <h3 className="text-lg font-semibold text-green-900">
            Week {currentWeekNumber} Update Submitted!
          </h3>
          <p className="mt-2 text-green-700">
            Your weekly progress has been recorded. AI analysis will be
            generated shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Launch Section */}
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
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-center">
                <PartyPopper className="mx-auto h-8 w-8 text-green-600" />
                <p className="mt-2 font-medium text-green-900">
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

        {/* Users Section */}
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

        {/* Primary Metric Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Metric</CardTitle>
            <CardDescription>
              Choose one metric to focus on this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="primaryMetricType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose your primary metric *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIMARY_METRIC_GROUPS).map(
                          ([group, metrics]) => (
                            <div key={group}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {group}
                              </div>
                              {metrics.map((metric) => (
                                <SelectItem
                                  key={metric.value}
                                  value={metric.value}
                                >
                                  {metric.label}
                                </SelectItem>
                              ))}
                            </div>
                          ),
                        )}
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
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="0"
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
          </CardContent>
        </Card>

        {/* Goals Section */}
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

        {/* Morale Section */}
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
