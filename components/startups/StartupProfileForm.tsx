"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LocationSelector, type LocationContext } from "@/components/location";
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
import { Textarea } from "@/components/ui/textarea";
import { useCheckSlug, useCreateStartup, useUpdateStartup } from "@/hooks";

const startupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Must be lowercase letters, numbers, and hyphens"),
  tagline: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  industry: z.string().max(100).optional(),
  stage: z
    .enum(["IDEA", "VALIDATION", "BUILDING", "LAUNCHED", "SCALING"])
    .optional(),
  targetMarket: z.enum(["CONSUMER", "SMB", "ENTERPRISE"]).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().max(200).optional(),
});

type StartupFormValues = z.infer<typeof startupFormSchema>;

interface StartupProfileFormProps {
  ideaId: string;
  ideaTitle?: string;
  ideaSummary?: string;
  existingStartup?: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    industry: string | null;
    stage: string;
    targetMarket: string | null;
    website: string | null;
    location: string | null;
  };
  onSuccess?: () => void;
  canEdit?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function formatLocationValue(location: LocationContext | null): string {
  if (!location) return "";
  if (location.isGlobal) return "Global";

  return [location.city, location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

export function StartupProfileForm({
  ideaId,
  ideaTitle,
  ideaSummary,
  existingStartup,
  onSuccess,
  canEdit = true,
}: StartupProfileFormProps) {
  const router = useRouter();
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationContext | null>(null);

  const createMutation = useCreateStartup();
  const updateMutation = useUpdateStartup();
  const checkSlugMutation = useCheckSlug();

  const isEditing = !!existingStartup;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      name: existingStartup?.name || ideaTitle || "",
      slug:
        existingStartup?.slug ||
        ideaTitle?.toLowerCase().replaceAll(" ", "-") ||
        "",
      tagline: existingStartup?.tagline || "",
      description: existingStartup?.description || ideaSummary || "",
      industry: existingStartup?.industry || "",
      stage: (existingStartup?.stage as StartupFormValues["stage"]) || "IDEA",
      targetMarket:
        (existingStartup?.targetMarket as StartupFormValues["targetMarket"]) ||
        undefined,
      website: existingStartup?.website || "",
      location: existingStartup?.location || "",
    },
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  const name = form.watch("name");

  const handleSlugCheck = async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    if (isEditing && slug === existingStartup?.slug) {
      setSlugAvailable(true);
      return;
    }

    setSlugChecking(true);
    try {
      const result = await checkSlugMutation.mutateAsync(slug);
      setSlugAvailable(result.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const onSubmit = async (data: StartupFormValues) => {
    if (!isEditing) {
      const result = await checkSlugMutation.mutateAsync(data.slug);
      if (!result.available) {
        form.setError("slug", { message: "This slug is already taken" });
        return;
      }
    }

    const payload = {
      ...data,
      tagline: data.tagline || undefined,
      description: data.description || undefined,
      industry: data.industry || undefined,
      stage: data.stage,
      targetMarket: data.targetMarket,
      website: data.website || undefined,
      location:
        formatLocationValue(selectedLocation) || data.location || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: existingStartup.id, data: payload },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, ideaId },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Startup Profile" : "Create Startup Profile"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your startup's information"
            : "Turn your validated idea into an active startup"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Inc"
                        disabled={!canEdit}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!slugManuallyEdited) {
                            const newSlug = generateSlug(e.target.value);
                            form.setValue("slug", newSlug, {
                              shouldValidate: true,
                            });
                            handleSlugCheck(newSlug);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="acme-inc"
                          disabled={!canEdit}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSlugManuallyEdited(true);
                            handleSlugCheck(e.target.value);
                          }}
                        />
                        {slugChecking && (
                          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                        {!slugChecking && slugAvailable === true && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                            Available
                          </span>
                        )}
                        {!slugChecking && slugAvailable === false && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive">
                            Taken
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      genesyz.ai/startups/{field.value || "your-slug"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A short, memorable description of what you do"
                      maxLength={200}
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your startup in detail..."
                      disabled={!canEdit}
                      className="min-h-32"
                      maxLength={5000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SaaS, FinTech, HealthTech..."
                        {...field}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={!canEdit}>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDEA">Idea</SelectItem>
                        <SelectItem value="VALIDATION">Validation</SelectItem>
                        <SelectItem value="BUILDING">Building</SelectItem>
                        <SelectItem value="LAUNCHED">Launched</SelectItem>
                        <SelectItem value="SCALING">Scaling</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Market</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={!canEdit}>
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONSUMER">Consumer</SelectItem>
                        <SelectItem value="SMB">
                          SMB (Small/Medium Business)
                        </SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourstartup.com"
                        disabled={!canEdit}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Location</FormLabel>
                    <FormControl>
                      <LocationSelector
                        id="startup-location-selector"
                        value={selectedLocation}
                        onChange={(location) => {
                          setSelectedLocation(location);
                          field.onChange(formatLocationValue(location));
                        }}
                        canEdit={canEdit}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value
                        ? `Selected: ${field.value}`
                        : "Pick a country, then region/state and city (optional)."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {canEdit && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || slugAvailable === false}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Save Changes" : "Create Startup Profile"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
