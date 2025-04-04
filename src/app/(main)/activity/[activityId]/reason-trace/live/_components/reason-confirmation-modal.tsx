import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import React from 'react';
import posthog from "posthog-js";

export default function ConfirmationModal({ 
  onSubmit, 
  loading,
} : { onSubmit: () => Promise<void>, loading: boolean }) {  
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-rose-700 text-white" size="sm">Submit Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to submit?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will submit your assignment. While you may resubmit the assignment your submission will be visible to the teacher.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}