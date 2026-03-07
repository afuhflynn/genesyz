"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Mail, Shield, MoreVertical } from "lucide-react";
import { 
  ACCELERATOR_ROLE_LABELS, 
  ACCELERATOR_ROLE_DESCRIPTIONS,
  type AcceleratorRole 
} from "@/lib/accelerator-permissions";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["PROGRAM_MANAGER", "OPERATIONS_LEAD", "MENTOR", "OBSERVER"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface Member {
  id: string;
  role: AcceleratorRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface Owner {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export function TeamManagement({ slug, currentRole }: { slug: string, currentRole: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canManageTeam = currentRole === "OWNER" || currentRole === "PROGRAM_MANAGER";

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "PROGRAM_MANAGER",
    },
  });

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/accelerators/${slug}/team`);
      const data = await res.json();
      if (data.data) {
        setMembers(data.data);
        setOwner(data.owner);
      }
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [slug]);

  const onInvite = async (values: InviteFormValues) => {
    try {
      setIsInviting(true);
      const res = await fetch(`/api/accelerators/${slug}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");

      toast.success("Invitation sent successfully!");
      setIsDialogOpen(false);
      form.reset();
      // Optionally refresh team if we add pending invites to the list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsInviting(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your accelerator staff and their specific access levels.
          </p>
        </div>
        {canManageTeam && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join the {slug} management team.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="colleague@example.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ACCELERATOR_ROLE_LABELS)
                              .filter(([key]) => key !== "OWNER")
                              .map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex flex-col">
                                    <span>{label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {ACCELERATOR_ROLE_DESCRIPTIONS[key as AcceleratorRole]}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Owner Row */}
            {owner && (
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={owner.image || ""} />
                      <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{owner.name}</span>
                      <span className="text-xs text-muted-foreground">{owner.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                    <Shield className="mr-1 h-3 w-3" />
                    Superior Admin
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">Program Creator</TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}

            {/* Other Members */}
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.user.name}</span>
                      <span className="text-xs text-muted-foreground">{member.user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ACCELERATOR_ROLE_LABELS[member.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                   {canManageTeam && (
                      <Button variant="ghost" size="icon">
                         <MoreVertical className="h-4 w-4" />
                      </Button>
                   )}
                </TableCell>
              </TableRow>
            ))}

            {members.length === 0 && !owner && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
