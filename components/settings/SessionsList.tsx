"use client";

import { format } from "date-fns";
import { Globe, Loader2, Monitor, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

interface Session {
  id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  current?: boolean;
}

export function SessionsList() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const json = await res.json();
      setSessions(
        (json.data || []).map((s: Session) => ({
          ...s,
          current: s.id === session?.session?.id,
        })),
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (id: string) => {
    setRevokingId(id);
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    } finally {
      setRevokingId(null);
    }
  };

  const deviceIcon = (ua: string) => {
    const lower = ua.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Sessions across all your devices. Revoke any session you don&apos;t
          recognize.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions</p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  {deviceIcon(s.userAgent)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {s.userAgent
                        ? s.userAgent.slice(0, 60) + (s.userAgent.length > 60 ? "..." : "")
                        : "Unknown device"}
                    </p>
                    {s.current && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Globe className="mr-1 inline h-3 w-3" />
                    {s.ipAddress || "Unknown IP"}
                    {" · "}
                    {s.createdAt
                      ? format(new Date(s.createdAt), "MMM d, yyyy")
                      : "Unknown"}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={revokingId === s.id}
                  onClick={() => revokeSession(s.id)}
                >
                  {revokingId === s.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
