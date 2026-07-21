"use client";

import { Loader2, Shield, ShieldOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

export function SecuritySettings() {
  const { data: session } = useSession();
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const isEnabled = session?.user?.twoFactorEnabled;

  if (isEnabled === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Shield className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {isEnabled
                ? "Your account is protected with 2FA"
                : "Add an extra layer of security to your account"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled ? (
          <Button
            variant="outline"
            disabled={disabling}
            onClick={async () => {
              setDisabling(true);
              try {
                const { error } = await (
                  await import("@/lib/auth-client")
                ).authClient.twoFactor.disable({
                  password: "",
                  // In practice, prompt for password
                });
                if (error) throw error;
                window.location.reload();
              } catch {
                setDisabling(false);
              }
            }}
          >
            {disabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable 2FA
          </Button>
        ) : (
          <Button
            disabled={enabling}
            onClick={async () => {
              setEnabling(true);
              try {
                const { data } = await (
                  await import("@/lib/auth-client")
                ).authClient.twoFactor.enable({
                  password: "",
                });
                if (data?.totpURI) {
                  // Show QR or copy URI
                  window.open(
                    `data:image/svg+xml,${encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
                        <text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="12">
                          Scan with authenticator app
                        </text>
                      </svg>`,
                    )}`,
                  );
                }
                window.location.reload();
              } catch {
                setEnabling(false);
              }
            }}
          >
            {enabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
