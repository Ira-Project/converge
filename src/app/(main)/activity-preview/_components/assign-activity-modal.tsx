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
import { CheckCircle, Copy } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [createdActivityId, setCreatedActivityId] = useState<string>("");
  const router = useRouter();
  
  const createActivity = api.activities.createActivity.useMutation({
    onSuccess: (data) => {
      posthog.capture("activity_assigned", {
        activityType,
        classroomId,
        assignmentId,
      });
      setCreatedActivityId(data?.id ?? "");
      setIsSuccess(true);
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

  const handleCloseModal = () => {
    setOpen(false);
    setIsSuccess(false);
    setCopiedUrl(false);
    setCreatedActivityId("");
    form.reset();
  };

  // Safe way to get the activity URL that works with SSR
  const getActivityUrl = () => {
    if (!createdActivityId) return "";
    
    const activityMetaData = getMetaDataFromActivityType(activityType, createdActivityId);
    
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${activityMetaData.url}live`;
    }
    return `${activityMetaData.url}live`;
  };

  const handleCopyUrl = async () => {
    try {
      const activityUrl = getActivityUrl();
      await navigator.clipboard.writeText(activityUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const renderSuccessContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mt-4" />
        <div>
          <h3 className="text-lg font-semibold text-green-700">Activity Successfully Assigned!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            "{activityName}" has been assigned to your classroom and students can now access it.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Activity URL:</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={getActivityUrl()}
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
            />
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              {copiedUrl ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCloseModal} className={buttonColor}>
          Done
        </Button>
      </div>
    </div>
  );

  const renderFormContent = () => (
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
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <LoadingButton 
            className={buttonColor}
            loading={createActivity.isLoading}
            type="submit">
            Assign Activity
          </LoadingButton>
        </div>
      </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonColor}>
          Assign Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="p-8 pb-16">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? "Activity Assigned" : "Assign Activity to Classroom"}
          </DialogTitle>
        </DialogHeader>
        {isSuccess ? renderSuccessContent() : renderFormContent()}
      </DialogContent>  
    </Dialog>
  );
} 