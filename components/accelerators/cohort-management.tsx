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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Users, Calendar, Search, ArrowRight, UserCheck, FileText } from "lucide-react";
import { InvestorOnePager } from "./investor-one-pager";

const cohortSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type CohortFormValues = z.infer<typeof cohortSchema>;

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  _count: { startups: number };
}

interface StartupSearchResult {
  id: string;
  name: string;
  industry: string | null;
  user: { name: string, email: string };
}

export function CohortManagement({ slug, currentRole }: { slug: string, currentRole: string }) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [startups, setStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStartups, setIsLoadingStartups] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Onboarding states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StartupSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const canManageCohorts = currentRole === "OWNER" || currentRole === "PROGRAM_MANAGER";

  const form = useForm<CohortFormValues>({
    resolver: zodResolver(cohortSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const fetchCohorts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/accelerators/${slug}/cohorts`);
      const data = await res.json();
      if (data.data) {
        setCohorts(data.data);
        if (data.data.length > 0 && !selectedCohort) {
          setSelectedCohort(data.data[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCohortStartups = async (cohortId: string) => {
    try {
      setIsLoadingStartups(true);
      const res = await fetch(`/api/accelerators/${slug}/cohorts/${cohortId}/startups`);
      const data = await res.json();
      if (data.data) {
        setStartups(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch startups for this cohort");
    } finally {
      setIsLoadingStartups(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, [slug]);

  useEffect(() => {
    if (selectedCohort) {
      fetchCohortStartups(selectedCohort.id);
    }
  }, [selectedCohort]);

  const onCreateCohort = async (values: CohortFormValues) => {
    try {
      setIsCreating(true);
      const res = await fetch(`/api/accelerators/${slug}/cohorts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create cohort");

      toast.success("Cohort created successfully!");
      setIsDialogOpen(false);
      form.reset();
      fetchCohorts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const onSearchStartups = async () => {
    if (searchQuery.length < 2) return;
    try {
      setIsSearching(true);
      const res = await fetch(`/api/startups/search?q=${searchQuery}`);
      const data = await res.json();
      if (data.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const onboardStartup = async (startupId: string) => {
    if (!selectedCohort) return;
    try {
      const res = await fetch(`/api/accelerators/${slug}/cohorts/${selectedCohort.id}/startups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to onboard startup");

      toast.success("Startup onboarded successfully!");
      setSearchResults(prev => prev.filter(s => s.id !== startupId));
      fetchCohortStartups(selectedCohort.id);
      fetchCohorts(); // Update count
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Cohorts Sidebar */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-semibold">Cohorts</h3>
           {canManageCohorts && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                 <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                       <Plus className="h-4 w-4" />
                    </Button>
                 </DialogTrigger>
                 <DialogContent>
                    <Form {...form}>
                       <form onSubmit={form.handleSubmit(onCreateCohort)} className="space-y-4">
                          <DialogHeader>
                             <DialogTitle>Create New Cohort</DialogTitle>
                             <DialogDescription>Add a new batch of startups to your program.</DialogDescription>
                          </DialogHeader>

                          <FormField
                             control={form.control}
                             name="name"
                             render={({ field }) => (
                                <FormItem>
                                   <FormLabel>Cohort Name</FormLabel>
                                   <FormControl>
                                      <Input placeholder="Winter 2026" {...field} />
                                   </FormControl>
                                   <FormMessage />
                                </FormItem>
                             )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                   <FormItem>
                                      <FormLabel>Start Date</FormLabel>
                                      <FormControl>
                                         <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                   </FormItem>
                                )}
                             />
                             <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                   <FormItem>
                                      <FormLabel>End Date</FormLabel>
                                      <FormControl>
                                         <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                   </FormItem>
                                )}
                             />
                          </div>

                          <DialogFooter>
                             <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Cohort
                             </Button>
                          </DialogFooter>
                       </form>
                    </Form>
                 </DialogContent>
              </Dialog>
           )}
        </div>

        <div className="space-y-2">
           {cohorts.map((cohort) => (
              <button
                 key={cohort.id}
                 onClick={() => setSelectedCohort(cohort)}
                 className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCohort?.id === cohort.id 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "hover:bg-muted"
                 }`}
              >
                 <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{cohort.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{cohort._count.startups} Startups</Badge>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                 </div>
              </button>
           ))}
        </div>
      </div>

      {/* Cohort Detail View */}
      <div className="md:col-span-3 space-y-6">
        {selectedCohort ? (
           <>
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-bold">{selectedCohort.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCohort.description || "Active batch management."}</p>
                 </div>
                 <div className="flex gap-2">
                    {canManageCohorts && (
                       <Dialog>
                          <DialogTrigger asChild>
                             <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Onboard Startups
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                             <DialogHeader>
                                <DialogTitle>Onboard Startups</DialogTitle>
                                <DialogDescription>Search for startups on Genesyz to add them to {selectedCohort.name}.</DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                                <div className="flex gap-2">
                                   <Input 
                                      placeholder="Search by name, industry, or owner email..." 
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && onSearchStartups()}
                                   />
                                   <Button size="icon" onClick={onSearchStartups} disabled={isSearching}>
                                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                   </Button>
                                </div>

                                <div className="max-h-[300px] overflow-auto space-y-2 pr-2">
                                   {searchResults.map((s) => (
                                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                         <div>
                                            <p className="font-medium text-sm">{s.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{s.user.email} • {s.industry || "General"}</p>
                                         </div>
                                         <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onboardStartup(s.id)}>
                                            Add <ArrowRight className="ml-1 h-3 w-3" />
                                         </Button>
                                      </div>
                                   ))}
                                   {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                                      <p className="text-center py-8 text-sm text-muted-foreground">No startups found matching your query.</p>
                                   )}
                                </div>
                             </div>
                          </DialogContent>
                       </Dialog>
                    )}
                 </div>
              </div>

              <Card>
                 <CardHeader>
                    <CardTitle className="text-lg">Startup Performance Overview</CardTitle>
                    <CardDescription>Track the latest updates and health of all startups in this batch.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Table>
                       <TableHeader>
                          <TableRow>
                             <TableHead>Startup</TableHead>
                             <TableHead>Stage</TableHead>
                             <TableHead>Last Update</TableHead>
                             <TableHead>Morale</TableHead>
                             <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {isLoadingStartups ? (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                   <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                             </TableRow>
                          ) : startups.length > 0 ? (
                             startups.map((s) => (
                                <TableRow key={s.startup.id}>
                                   <TableCell className="font-medium">
                                      {s.startup.name}
                                   </TableCell>
                                   <TableCell>
                                      <Badge variant="outline" className="text-[10px] uppercase">
                                         {s.startup.stage}
                                      </Badge>
                                   </TableCell>
                                   <TableCell className="text-sm text-muted-foreground">
                                      {s.startup.weeklyUpdates[0] 
                                         ? new Date(s.startup.weeklyUpdates[0].createdAt).toLocaleDateString()
                                         : "No updates yet"
                                      }
                                   </TableCell>
                                   <TableCell>
                                      {s.startup.weeklyUpdates[0] ? (
                                         <div className="flex items-center gap-1">
                                            <div className={`h-2 w-2 rounded-full ${s.startup.weeklyUpdates[0].moraleScore > 7 ? 'bg-emerald-500' : s.startup.weeklyUpdates[0].moraleScore > 4 ? 'bg-amber-500' : 'bg-destructive'}`} />
                                            <span className="text-sm">{s.startup.weeklyUpdates[0].moraleScore}/10</span>
                                         </div>
                                      ) : "-"}
                                   </TableCell>
                                   <TableCell className="text-right flex items-center justify-end gap-2">
                                      <InvestorOnePager slug={slug} startupId={s.startup.id} />
                                      <Button variant="ghost" size="sm">Dashboard</Button>
                                   </TableCell>
                                </TableRow>
                             ))
                          ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                                   No startups in this cohort yet. Click "Onboard Startups" to add some.
                                </TableCell>
                             </TableRow>
                          )}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
           </>
        ) : (
           <div className="flex h-[400px] flex-col items-center justify-center border-2 border-dashed rounded-xl text-center p-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Cohort Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                 Select a cohort from the sidebar or create a new one to start managing your startups.
              </p>
              {canManageCohorts && (
                 <Button onClick={() => setIsDialogOpen(true)}>
                    Create First Cohort
                 </Button>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
