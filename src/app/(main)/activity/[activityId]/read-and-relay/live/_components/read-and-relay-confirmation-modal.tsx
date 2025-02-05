import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/loading-button";

export default function ReadAndRelayConfirmationModal({ 
  onSubmit, 
  loading,
} : { onSubmit: () => void, loading: boolean }) {  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          className="bg-blue-700 text-white hover:bg-blue-900">
          Submit Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-xl">Are you sure you want to submit?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will submit your assignment. While you may resubmit the assignment your submission will be visible to the teacher.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton 
            className="bg-blue-700 text-white hover:bg-blue-900"
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