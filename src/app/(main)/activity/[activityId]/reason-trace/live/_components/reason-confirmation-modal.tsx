import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import React from 'react';
import posthog from "posthog-js";

export default function ConfirmationModal({ 
  onSubmit, 
  loading,
  dueDatePassed = false,
} : { onSubmit: () => Promise<void>, loading: boolean, dueDatePassed?: boolean }) {  
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-rose-700 text-white" size="sm">Submit Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dueDatePassed ? "Due Date Has Passed" : "Are you sure you want to submit?"}
          </DialogTitle>
          <DialogDescription>
            {dueDatePassed 
              ? "The due date for this assignment has passed. Please contact your teacher for assistance with submitting this assignment." 
              : "This action cannot be undone. This will submit your assignment. While you may resubmit the assignment your submission will be visible to the teacher."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">{dueDatePassed ? "Close" : "Cancel"}</Button>
          </DialogClose>
          {!dueDatePassed && (
            <LoadingButton 
              className="bg-rose-700 text-white"
              loading={loading}
              onClick={ async () => {
                posthog.capture("reason_trace_submitted");
                await onSubmit();
                closeRef.current?.click();
              }}>
              Submit
            </LoadingButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}