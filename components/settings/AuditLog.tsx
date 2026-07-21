"use client";

import { format } from "date-fns";
import { History, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuditEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AuditResponse {
  data: AuditEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AuditLog() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs?limit=20")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatAction = (action: string) => {
    return action
      .replace(/\./g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Recent activity on your account</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries yet</p>
        ) : (
          <div className="space-y-2">
            {data.data.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="rounded-md bg-muted p-1.5">
                  <History className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatAction(entry.action)}
                  </p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {JSON.stringify(entry.metadata)}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
            ))}
            {data.pagination.totalPages > 1 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
                {" · "}
                {data.pagination.total} entries
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
