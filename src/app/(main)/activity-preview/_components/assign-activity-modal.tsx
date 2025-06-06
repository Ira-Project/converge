'use client';

import React, { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/icons";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils";
import type { ActivityType } from "@/lib/constants";
// toast import removed as it's not used
import { z } from "zod";

const assignActivitySchema = z.object({
  dueDate: z.date().min(addDays(new Date(), 1), "Due date must be at least tomorrow"),
});

interface AssignActivityModalProps {
  classroomId: string;
  assignmentId: string;
  activityType: ActivityType;
  activityName: string;
  topicId: string;
}

export function AssignActivityModal({
  classroomId,
  assignmentId,
  activityType,
  activityName,
  topicId
}: AssignActivityModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const createActivity = api.activities.createActivity.useMutation({
    onSuccess: (_data) => {
      posthog.capture("activity_assigned", {
        activityType,
        classroomId,
        assignmentId,
      });
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to assign activity:", error);
    }
  });

  const form = useForm<z.infer<typeof assignActivitySchema>>({
    resolver: zodResolver(assignActivitySchema),
    defaultValues: {
      dueDate: addDays(new Date(), 7), // Default to 1 week from now
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createActivity.mutate({
      classroomId,
      assignmentId,
      activityType,
      activityName,
      topicId,
      dueDate: data.dueDate,
    });
  });

  const activityMetaData = getMetaDataFromActivityType(activityType);
  const buttonColor = `bg-${activityMetaData.colour}-700 hover:bg-${activityMetaData.colour}-900`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonColor}>
          Assign Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="p-8 pb-16">
        <DialogHeader>
          <DialogTitle>Assign Activity to Classroom</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <DialogDescription className="text-sm">
              Assign "{activityName}" to your classroom. Students will be able to access this activity once assigned.
            </DialogDescription>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < addDays(new Date(), 1)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <LoadingButton 
                className={buttonColor}
                loading={createActivity.isLoading}
                type="submit">
                Assign Activity
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>  
    </Dialog>
  );
} 