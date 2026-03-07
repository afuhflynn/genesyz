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
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Target, 
  Plus, 
  FileEdit, 
  History, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

const kpiSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  targetValue: z.string().min(1, "Target is required"),
  unit: z.string().optional(),
  deadline: z.string().optional(),
});

const reportSchema = z.object({
  weekNumber: z.string().min(1, "Week number is required"),
  content: z.string().min(20, "Please provide a more detailed report"),
});

type KpiFormValues = z.infer<typeof kpiSchema>;
type ReportFormValues = z.infer<typeof reportSchema>;

interface KPI {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  deadline: string | null;
}

interface Report {
  id: string;
  weekNumber: number;
  content: string;
  aiSummary: string | null;
  createdAt: string;
}

export function KpiReporting({ slug, currentRole }: { slug: string, currentRole: string }) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingKpi, setIsCreatingKpi] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);

  const canManageKpis = currentRole === "OWNER" || currentRole === "PROGRAM_MANAGER";
  const canSubmitReports = currentRole === "OWNER" || currentRole === "PROGRAM_MANAGER";

  const kpiForm = useForm<KpiFormValues>({
    resolver: zodResolver(kpiSchema),
    defaultValues: { name: "", targetValue: "", unit: "", deadline: "" },
  });

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { weekNumber: "1", content: "" },
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [kpisRes, reportsRes] = await Promise.all([
        fetch(`/api/accelerators/${slug}/kpis`),
        fetch(`/api/accelerators/${slug}/reports`)
      ]);
      const kpisData = await kpisRes.json();
      const reportsData = await reportsRes.json();
      if (kpisData.data) setKpis(kpisData.data);
      if (reportsData.data) setReports(reportsData.data);
    } catch (error) {
      toast.error("Failed to fetch reporting data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const onCreateKpi = async (values: KpiFormValues) => {
    try {
      setIsCreatingKpi(true);
      const res = await fetch(`/api/accelerators/${slug}/kpis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create KPI");
      toast.success("KPI created successfully!");
      setIsKpiDialogOpen(false);
      kpiForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreatingKpi(false);
    }
  };

  const onSubmitReport = async (values: ReportFormValues) => {
    try {
      setIsSubmittingReport(true);
      const res = await fetch(`/api/accelerators/${slug}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      toast.success("Weekly report submitted!");
      reportForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const updateKpiValue = async (id: string, currentValue: string) => {
    try {
      const res = await fetch(`/api/accelerators/${slug}/kpis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentValue }),
      });
      if (!res.ok) throw new Error("Failed to update KPI");
      toast.success("KPI updated!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading && kpis.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: KPI Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Program KPIs</h2>
            <p className="text-sm text-muted-foreground">Set and track high-level program goals.</p>
          </div>
          {canManageKpis && (
            <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add KPI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...kpiForm}>
                  <form onSubmit={kpiForm.handleSubmit(onCreateKpi)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Define Program KPI</DialogTitle>
                      <DialogDescription>Set a target for your accelerator batch.</DialogDescription>
                    </DialogHeader>
                    <FormField control={kpiForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>KPI Name</FormLabel>
                        <FormControl><Input placeholder="Total Cohort Revenue" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={kpiForm.control} name="targetValue" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Value</FormLabel>
                          <FormControl><Input type="number" placeholder="100000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={kpiForm.control} name="unit" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit (e.g. $, %, qty)</FormLabel>
                          <FormControl><Input placeholder="$" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isCreatingKpi}>
                        {isCreatingKpi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create KPI
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{kpi.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      className="w-20 h-7 text-xs" 
                      type="number" 
                      defaultValue={kpi.currentValue}
                      onBlur={(e) => updateKpiValue(kpi.id, e.target.value)}
                      disabled={!canManageKpis}
                    />
                    <span className="text-xs text-muted-foreground">/ {kpi.targetValue} {kpi.unit}</span>
                  </div>
                </div>
                <div className="space-y-1">
                   <Progress value={(kpi.currentValue / kpi.targetValue) * 100} />
                   <p className="text-[10px] text-right text-muted-foreground">
                      {Math.round((kpi.currentValue / kpi.targetValue) * 100)}% achieved
                   </p>
                </div>
              </CardContent>
            </Card>
          ))}
          {kpis.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
               <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
               <p className="text-sm text-muted-foreground">No KPIs defined for this program yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Weekly Hub Reports */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Weekly Hub Reports</h2>
          <p className="text-sm text-muted-foreground">Submit and review program-level progress reports.</p>
        </div>

        {canSubmitReports && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
               <CardTitle className="text-sm flex items-center gap-2">
                  <FileEdit className="h-4 w-4" /> New Weekly Report
               </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...reportForm}>
                <form onSubmit={reportForm.handleSubmit(onSubmitReport)} className="space-y-4">
                  <FormField control={reportForm.control} name="weekNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Program Week #</FormLabel>
                      <FormControl><Input type="number" className="h-8" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={reportForm.control} name="content" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Report Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Summarize the program's progress, common cohort bottlenecks, and next week's plan..." 
                          className="min-h-[120px] text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" size="sm" className="w-full" disabled={isSubmittingReport}>
                    {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Report & Generate AI Summary
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
           <h3 className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4" /> Report History
           </h3>
           {reports.map((report) => (
             <Card key={report.id}>
               <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                     <Badge variant="secondary">Week {report.weekNumber}</Badge>
                     <span className="text-[10px] text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Sparkles className="h-3 w-3 text-primary" />
               </CardHeader>
               <CardContent className="py-3 px-4">
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                     {report.content}
                  </p>
                  {report.aiSummary && (
                    <div className="mt-3 pt-3 border-t">
                       <p className="text-[10px] font-bold uppercase text-primary mb-1">AI Synthesis</p>
                       <p className="text-[10px] text-muted-foreground italic">
                          {report.aiSummary}
                       </p>
                    </div>
                  )}
               </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
