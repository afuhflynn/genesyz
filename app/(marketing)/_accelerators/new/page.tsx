"use client";

import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAccelerator } from "@/hooks";

const PROGRAM_TYPES = [
  { value: "accelerator", label: "Accelerator" },
  { value: "incubator", label: "Incubator" },
  { value: "cohort_based", label: "Cohort-Based Program" },
  { value: "fellowship", label: "Fellowship" },
  { value: "VC", label: "Venture Capital" },
];

export default function NewAcceleratorPage() {
  const router = useRouter();
  const createMutation = useCreateAccelerator();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    programType: "accelerator",
    website: "",
    contactEmail: "",
    durationWeeks: "",
    benefits: "",
    requirements: "",
    maxStartups: "",
    fundingAmount: "",
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      name: formData.name,
      description: formData.description || undefined,
      programType: formData.programType,
      website: formData.website || undefined,
      contactEmail: formData.contactEmail || undefined,
      durationWeeks: formData.durationWeeks
        ? parseInt(formData.durationWeeks)
        : undefined,
      benefits: formData.benefits || undefined,
      requirements: formData.requirements || undefined,
      maxStartups: formData.maxStartups
        ? parseInt(formData.maxStartups)
        : undefined,
      fundingAmount: formData.fundingAmount || undefined,
      isPublic: formData.isPublic,
    });
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/accelerators">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accelerators
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Accelerator</h1>
        <p className="mt-2 text-muted-foreground">
          Set up a new accelerator program to help startups grow
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                The main details about your accelerator program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Y Combinator, Techstars"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is your accelerator program about?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="programType">Program Type</Label>
                  <Select
                    value={formData.programType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, programType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                  <Input
                    id="durationWeeks"
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.durationWeeks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationWeeks: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Website</CardTitle>
              <CardDescription>
                How founders can reach your program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>
                Additional information about your program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxStartups">Max Startups</Label>
                  <Input
                    id="maxStartups"
                    type="number"
                    placeholder="e.g., 20"
                    value={formData.maxStartups}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStartups: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingAmount">Funding Amount</Label>
                  <Input
                    id="fundingAmount"
                    placeholder="e.g., $500k - $1M"
                    value={formData.fundingAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundingAmount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  placeholder="What benefits do you offer? (mentorship, funding, etc.)"
                  value={formData.benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="What are the requirements to apply?"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic">Public Listing</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your accelerator visible to everyone
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublic: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/accelerators">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Accelerator
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
