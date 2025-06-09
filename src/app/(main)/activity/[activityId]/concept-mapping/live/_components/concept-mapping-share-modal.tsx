'use client';

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Share1Icon } from "@/components/icons";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { makeActivityLiveSchema } from "@/server/api/routers/activities/activities.input";
import { Paths } from "@/lib/constants";
import posthog from "posthog-js";

export default function AssignmentShareModal({ 
  activityId, isLive
} : { activityId: string, isLive: boolean }) {  

  const makeAssignmentLive = api.activities.makeActivityLive.useMutation();

  const [liveState, setLiveState] = useState<boolean>(isLive);
  
  const form = useForm({
    defaultValues: {
      activityId: activityId,
      dueDate: addDays(new Date(), 1),
    },
    resolver: zodResolver(makeActivityLiveSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    posthog.capture("concept_mapping_live_published", {
      dueDate: values.dueDate,
    });
    await makeAssignmentLive.mutateAsync({
      activityId: activityId,
      dueDate: values.dueDate,
    });
    setLiveState(true);
  });

  const [copied, setCopied] = useState(false);
  
  const [assignmentLink, setAssignmentLink] = useState<string>('');

  useEffect(() => {
    // Set the assignment link after component mounts
    setAssignmentLink(`${window.location.origin}${Paths.Activity}${activityId}${Paths.ConceptMapping}${Paths.LiveActivity}`);
  }, [activityId]);

  const copyToClipboard = async () => {
    posthog.capture("concept_mapping_live_share_copied");
    await navigator.clipboard.writeText(assignmentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => {
        posthog.capture("concept_mapping_live_share_clicked");
      }}>
        <Button size="sm" className="bg-fuchsia-700 hover:bg-fuchsia-900">
          Share
          <Share1Icon />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-8 pb-16">
        <DialogHeader>
          <DialogTitle>Share Activity</DialogTitle>
        </DialogHeader>
        { liveState ?
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This activity is live. Share the link with your students:
            </p>
            <div className="flex gap-2">
              <Input 
                readOnly 
                value={assignmentLink}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? 
                  <Check className="h-4 w-4" /> : 
                  <Copy className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
          :
          <Form {...form}>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <DialogDescription className="text-sm">
              Make your activity available to your students
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
                  className="bg-fuchsia-700 hover:bg-fuchsia-900"
                  onClick={onSubmit}
                  loading={makeAssignmentLive.isLoading}
                  type="submit">
                  Publish
                </LoadingButton>
              </div>
            </form>
          </Form>
        }
      </DialogContent>  
    </Dialog>
  );
}