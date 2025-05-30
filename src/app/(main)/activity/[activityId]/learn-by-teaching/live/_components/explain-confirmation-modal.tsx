import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import posthog from "posthog-js";
import React from "react";

export default function ConfirmationModal({ 
  onSubmit, 
  loading,
  dueDatePassed = false,
} : { onSubmit: () => Promise<void>, loading: boolean, dueDatePassed?: boolean }) {  
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => {
        posthog.capture("learn_by_teaching_live_share_clicked");
      }}>
        <Button 
          size="sm"
          className="bg-amber-700 text-white hover:bg-amber-900">
          Submit Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-xl">
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
          <DialogClose asChild>
            <Button variant="outline">{dueDatePassed ? "Close" : "Cancel"}</Button>
          </DialogClose>
          {!dueDatePassed && (
            <LoadingButton 
              className="bg-amber-700 text-white hover:bg-amber-900"
              loading={loading}
              onClick={ async () => {
                posthog.capture("learn_by_teaching_submitted");
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