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
            There's a lot of things I've learned from you.
            Thank you for teaching me. Wishing you a day as awesome as you are!
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