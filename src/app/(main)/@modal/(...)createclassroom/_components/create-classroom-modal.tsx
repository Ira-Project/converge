'use client';
import { useRouter } from 'next/navigation'

import { CreateClassroomForm } from "./create-classroom-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type RouterOutputs } from '@/trpc/shared';

interface Props {
  courses: RouterOutputs["subject"]["listCourses"];
}

export default function CreateClassroomModal({ courses } : Props) {

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
        <CreateClassroomForm courses={courses} />
      </DialogContent>
    </Dialog>
  );
}