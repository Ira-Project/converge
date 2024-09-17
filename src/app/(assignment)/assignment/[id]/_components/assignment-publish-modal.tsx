'use client';

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/icons";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeAssignmentLiveSchema } from "@/server/api/routers/assignment/assignment.input";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function AssignmentPublishModal({ 
  assignmentId, 
} : { assignmentId: string }) {  

  const router = useRouter();
  const makeAssignmentLive = api.assignment.makeLive.useMutation();
  
  const form = useForm({
    defaultValues: {
      assignmentId: assignmentId,
      assignmentName: "",
      dueDate: addDays(new Date(), 1),
    },
    resolver: zodResolver(makeAssignmentLiveSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    console.log("DUDE", values)
    await makeAssignmentLive.mutateAsync({
      assignmentName: values.assignmentName,
      assignmentId: assignmentId,
      dueDate: values.dueDate,
    });
    // TODO - redirect to statistics page
    // void router.replace(`${Paths.Assignment}${id}`)
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Publish</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Assignment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <DialogDescription className="text-sm">
              Make your assignment available to your students by filling out the details below.
            </DialogDescription>
            <FormField
              control={form.control}
              name="assignmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Name</FormLabel>
                  <FormControl>
                    <Input {...field} required placeholder="Enter your assignment name here"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
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
                onClick={onSubmit}
                loading={makeAssignmentLive.isLoading}
                type="submit">
                Publish
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}