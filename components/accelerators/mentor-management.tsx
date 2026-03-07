"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  UserPlus, 
  Link as LinkIcon, 
  Mail, 
  Tags, 
  Search, 
  UserCheck, 
  Trash2,
  ExternalLink
} from "lucide-react";

const mentorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  expertise: z.string().min(1, "At least one expertise area is required"),
  bio: z.string().optional(),
  linkedIn: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  bio: string | null;
  linkedIn: string | null;
  matches: {
    startup: { id: string, name: string };
    focus: string | null;
  }[];
}

interface Startup {
  id: string;
  name: string;
}

export function MentorManagement({ slug, currentRole }: { slug: string, currentRole: string }) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [cohortStartups, setCohortStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Match form states
  const [targetStartupId, setTargetStartupId] = useState("");
  const [matchFocus, setMatchFocus] = useState("");

  const canManageMentors = currentRole === "OWNER" || currentRole === "PROGRAM_MANAGER";

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      name: "",
      email: "",
      expertise: "",
      bio: "",
      linkedIn: "",
    },
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [mentorsRes, startupsRes] = await Promise.all([
        fetch(`/api/accelerators/${slug}/mentors`),
        fetch(`/api/accelerators/${slug}/cohorts`) // Get startups through cohorts
      ]);
      
      const mentorsData = await mentorsRes.json();
      const cohortsData = await startupsRes.json();
      
      if (mentorsData.data) setMentors(mentorsData.data);
      
      // Flatten startups from all cohorts
      if (cohortsData.data) {
        const allStartups: Startup[] = [];
        cohortsData.data.forEach((cohort: any) => {
          if (cohort.startups) {
            cohort.startups.forEach((cs: any) => {
              if (!allStartups.find(s => s.id === cs.startup.id)) {
                allStartups.push({
                  id: cs.startup.id,
                  name: cs.startup.name
                });
              }
            });
          }
        });
        setCohortStartups(allStartups);
      }
    } catch (error) {
      toast.error("Failed to fetch mentor data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const onCreateMentor = async (values: MentorFormValues) => {
    try {
      setIsCreating(true);
      const res = await fetch(`/api/accelerators/${slug}/mentors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expertise: values.expertise.split(",").map(e => e.trim()),
        }),
      });

      if (!res.ok) throw new Error("Failed to add mentor");

      toast.success("Mentor added to network!");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const onMatchMentor = async () => {
    if (!selectedMentor || !targetStartupId) return;
    try {
      setIsMatching(true);
      const res = await fetch(`/api/accelerators/${slug}/mentors/${selectedMentor.id}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupId: targetStartupId,
          focus: matchFocus,
        }),
      });

      if (!res.ok) throw new Error("Failed to pair mentor");

      toast.success("Mentor paired with startup!");
      setIsMatchDialogOpen(false);
      setTargetStartupId("");
      setMatchFocus("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading && mentors.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mentor Network</h2>
          <p className="text-sm text-muted-foreground">Manage experts and pair them with startups based on specific needs.</p>
        </div>
        {canManageMentors && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Mentor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateMentor)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Add New Mentor</DialogTitle>
                    <DialogDescription>Invite an expert to join your mentor network.</DialogDescription>
                  </DialogHeader>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="jane@expert.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expertise Areas (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="Marketing, Legal, Scaling, SaaS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add to Network
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                {mentor.linkedIn && (
                  <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <CardDescription className="flex items-center gap-1">
                 <Mail className="h-3 w-3" /> {mentor.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-1">
                {mentor.expertise.map((exp, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {exp}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between text-xs font-medium">
                    <span>Matched Startups</span>
                    <Badge variant="outline" className="text-[10px]">{mentor.matches.length}</Badge>
                 </div>
                 <div className="space-y-1">
                    {mentor.matches.length > 0 ? (
                       mentor.matches.map((m, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] bg-muted/50 p-1.5 rounded">
                             <span className="font-medium">{m.startup.name}</span>
                             <span className="text-muted-foreground">{m.focus || "General"}</span>
                          </div>
                       ))
                    ) : (
                       <p className="text-[10px] text-muted-foreground italic text-center py-2">No active pairings.</p>
                    )}
                 </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 mt-auto">
               <Button 
                  variant="outline" 
                  className="w-full text-xs h-8" 
                  size="sm"
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setIsMatchDialogOpen(true);
                  }}
                  disabled={!canManageMentors}
               >
                  <UserCheck className="mr-2 h-3 w-3" />
                  Pair with Startup
               </Button>
            </div>
          </Card>
        ))}

        {mentors.length === 0 && (
           <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Empty Mentor Network</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                 Start building your expert database to provide specialized guidance to your cohorts.
              </p>
              {canManageMentors && (
                 <Button onClick={() => setIsDialogOpen(true)}>
                    Add First Mentor
                 </Button>
              )}
           </div>
        )}
      </div>

      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Pair Mentor with Startup</DialogTitle>
               <DialogDescription>
                  Match <strong>{selectedMentor?.name}</strong> with a startup for specialized guidance.
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Select Startup</label>
                  <Select value={targetStartupId} onValueChange={setTargetStartupId}>
                     <SelectTrigger>
                        <SelectValue placeholder="Select a startup..." />
                     </SelectTrigger>
                     <SelectContent>
                        {cohortStartups.length > 0 ? (
                           cohortStartups.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                           ))
                        ) : (
                           <SelectItem value="none" disabled>No startups found in your cohorts</SelectItem>
                        )}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mentorship Focus</label>
                  <Input 
                    placeholder="e.g., Marketing Strategy, GTM, Legal Review" 
                    value={matchFocus}
                    onChange={(e) => setMatchFocus(e.target.value)}
                  />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={onMatchMentor} disabled={isMatching || !targetStartupId}>
                  {isMatching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Pairing
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
