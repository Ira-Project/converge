'use client';
import { useRouter } from 'next/navigation'

import { CreateClassroomForm } from "./create-classroom-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type RouterOutputs } from '@/trpc/shared';

interface Props {
  subjects: RouterOutputs["subject"]["list"];
}

export default function Page(subjects: Props) {

  const router = useRouter();

  return (
    <Dialog 
      open modal
      onOpenChange={(open) => { if(!open) router.back() }} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center">
            Create Classroom
          </DialogTitle>
        </DialogHeader>
        <CreateClassroomForm {...subjects} />
      </DialogContent>
    </Dialog>
  );
}