'use client';
import { useRouter } from 'next/navigation'

import { JoinClassroomForm } from "./join-classroom-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export default function JoinClassroomModal() {

  const router = useRouter();

  return (
    <Dialog 
      open modal
      onOpenChange={(open) => { if(!open) router.back() }} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center">
            Join Classroom
          </DialogTitle>
        </DialogHeader>
        <JoinClassroomForm />
      </DialogContent>
    </Dialog>
  );
}