"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { useAddFollower } from "@/hooks";

const addFollowerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100).optional(),
});

type AddFollowerValues = z.infer<typeof addFollowerSchema>;

interface AddFollowerDialogProps {
  startupId: string;
  onSuccess?: () => void;
}

export function AddFollowerDialog({
  startupId,
  onSuccess,
}: AddFollowerDialogProps) {
  const [open, setOpen] = useState(false);
  const addFollower = useAddFollower();

  const form = useForm<AddFollowerValues>({
    resolver: zodResolver(addFollowerSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (values: AddFollowerValues) => {
    try {
      await addFollower.mutateAsync({
        startupId,
        data: values,
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Follower
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Follower</DialogTitle>
          <DialogDescription>
            Add an external follower who will receive weekly progress updates
            via email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="investor@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={addFollower.isPending}>
                {addFollower.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Follower
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
