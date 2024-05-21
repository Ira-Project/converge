'use client'
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClockIcon, QuestionMarkIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import dynamic from "next/dynamic";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";
import { TutorialCarousel } from "./tutorial-carousel";

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
        className="max-w-4xl flex flex-col gap-8">
        <DialogHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href={classroom ? `${Paths.Classroom}${classroom.id}` : "/"}>
                    {classroom ? classroom.name : "Home"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Assignment</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <DialogTitle className="flex flex-row items-center text-3xl">
            {assignmentName}
          </DialogTitle>
          <div className="text-muted-foreground text-xs flex flex-row gap-2 items-center">
            <ClockIcon />
            <p>
              {timeLimit ? `${timeLimit} minutes` : "No Time Limit"}
            </p>
            <p>|</p>
            <p>
              {numberOfQuestions} Questions
            </p>
          </div>
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