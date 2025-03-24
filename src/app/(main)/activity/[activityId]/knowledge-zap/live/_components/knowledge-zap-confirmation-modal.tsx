import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";
import React from 'react';

export default function ConfirmationModal({ 
  onSubmit, 
  loading,
} : { onSubmit: () => Promise<void>, loading: boolean }) {  
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-lime-700 text-white hover:bg-lime-800" size="sm">Submit Activity</Button>
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
            className="bg-lime-700 text-white hover:bg-lime-800"
            loading={loading}
            onClick={ async () => {
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