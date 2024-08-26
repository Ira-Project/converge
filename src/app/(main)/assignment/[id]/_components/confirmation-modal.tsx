'use client'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";

export default function ConfirmationModal({ 
  onSubmit, 
  loading,
} : { onSubmit: () => void, loading: boolean }) {  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Submit Assignment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to submit?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will submit your assignment. While you may resubmit the assignment your submission will be visible to the teacher.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton 
            loading={loading}
            disabled={loading}
            onClick={onSubmit}>
            Submit
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}