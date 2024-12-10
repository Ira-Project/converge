'use client'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

export default function SubmissionModal({ open } : { open: boolean }) {  

  const router = useRouter();

  return (
    <Dialog open={open} 
      onOpenChange={(open) => { if(!open) { router.push('/')} }}
    >
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="mb-4 text-2xl">Assignment Submitted!</DialogTitle>
          <DialogDescription>
            Thank you for helping me fix the mistakes I made. I sure learnt a lot from you.
            Wishing you a day as awesome as you are!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="link">
              Back to Homepage
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}