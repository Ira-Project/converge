'use client'
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from "next/dynamic";
import { TutorialCarousel } from "./tutorial-carousel";
import AssignmentHeader from "./assignment-header";
import { QuestionMarkIcon } from "@/components/icons";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface Props {
  assignmentName: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
  timeLimit?: number | null;
  numberOfQuestions: number;
}

export default function AssignmentTutorialModal({ assignmentName, classroom, timeLimit, numberOfQuestions }: Props) {  

  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button 
          className='absolute right-4 bottom-4 text-muted-foreground rounded-full'
          variant="outline" 
          size="icon">
          <QuestionMarkIcon />
        </Button>
      </DialogTrigger>
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-3xl flex flex-col gap-8">
        <DialogHeader>
          <AssignmentHeader 
            assignmentName={assignmentName}
            classroom={classroom}
            timeLimit={timeLimit}
            numberOfQuestions={numberOfQuestions} />
        </DialogHeader>
        <div className="px-16">
          <TutorialCarousel />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              Start Assignment
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}