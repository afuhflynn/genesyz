"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  CalendarPlus,
  MapPin,
  Video,
  Clock,
  Filter,
  Users,
} from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  eventType: z.enum([
    "mentor_session",
    "office_hours",
    "demo_day",
    "workshop",
    "networking",
  ]),
  scheduledAt: z.string().min(1, "Date and time are required"),
  duration: z.string().min(1, "Duration is required"),
  location: z.string().optional(),
  meetingUrl: z
    .string()
    .url("Invalid meeting URL")
    .optional()
    .or(z.literal("")),
  cohortId: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  scheduledAt: string;
  duration: number;
  location: string | null;
  meetingUrl: string | null;
  cohort: { name: string } | null;
  _count: { attendance: number };
}

export function EventManagement({
  slug,
  currentRole,
}: {
  slug: string;
  currentRole: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCohort, setFilterCohort] = useState("all");

  const canManageEvents =
    currentRole === "OWNER" ||
    currentRole === "PROGRAM_MANAGER" ||
    currentRole === "OPERATIONS_LEAD";

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "workshop",
      scheduledAt: new Date().toISOString().slice(0, 16),
      duration: "60",
      location: "",
      meetingUrl: "",
      cohortId: "all",
    },
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, cohortsRes] = await Promise.all([
        fetch(
          `/api/accelerators/${slug}/events?cohortId=${filterCohort === "all" ? "" : filterCohort}`,
        ),
        fetch(`/api/accelerators/${slug}/cohorts`),
      ]);

      const eventsData = await eventsRes.json();
      const cohortsData = await cohortsRes.json();

      if (eventsData.data) setEvents(eventsData.data);
      if (cohortsData.data) setCohorts(cohortsData.data);
    } catch (error) {
      toast.error("Failed to fetch curriculum data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, filterCohort]);

  const onCreateEvent = async (values: EventFormValues) => {
    try {
      setIsCreating(true);
      const res = await fetch(`/api/accelerators/${slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      toast.success("Event scheduled successfully!");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Program Curriculum</h2>
          <p className="text-sm text-muted-foreground">
            Schedule workshops, office hours, and track RSVPs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCohort} onValueChange={setFilterCohort}>
              <SelectTrigger className="border-0 bg-transparent h-8 w-[150px] focus:ring-0 shadow-none">
                <SelectValue placeholder="All Cohorts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {cohorts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canManageEvents && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onCreateEvent)}
                    className="space-y-4"
                  >
                    <DialogHeader>
                      <DialogTitle>Schedule New Event</DialogTitle>
                      <DialogDescription>
                        Add a workshop or session to the program curriculum.
                      </DialogDescription>
                    </DialogHeader>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Market Strategy Workshop"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="workshop">
                                  Workshop
                                </SelectItem>
                                <SelectItem value="mentor_session">
                                  Mentor Session
                                </SelectItem>
                                <SelectItem value="office_hours">
                                  Office Hours
                                </SelectItem>
                                <SelectItem value="networking">
                                  Networking
                                </SelectItem>
                                <SelectItem value="demo_day">
                                  Demo Day
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cohortId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Cohort</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="All Cohorts" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">
                                  Entire Program
                                </SelectItem>
                                {cohorts.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (mins)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Physical or Virtual)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Zoom, Building A, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meetingUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Link (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://zoom.us/j/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Schedule Event
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>RSVPs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">
                        {event.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {event.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {event.eventType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium">
                      {event.cohort?.name || "Entire Program"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.scheduledAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        {event.meetingUrl ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        {event.location || "No location set"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">
                        {event._count.attendance} RSVPs
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No events scheduled for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
