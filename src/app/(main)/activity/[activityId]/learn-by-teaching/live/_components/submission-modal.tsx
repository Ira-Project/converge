'use client'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Paths } from "@/lib/constants";

export default function SubmissionModal({ open } : { open: boolean }) {  

  const router = useRouter();

  return (
    <Dialog open={open} 
      onOpenChange={(open) => { if(!open) { router.push(Paths.Classroom)} }}
    >
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="mb-4 text-xl">Activity Submitted!</DialogTitle>
          <DialogDescription>
            Great job teaching Ira concepts!
            Go back to the classroom to try out other activities.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="link">
              Back to Home
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}