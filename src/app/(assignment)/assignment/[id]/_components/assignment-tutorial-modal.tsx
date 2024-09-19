'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from "next/dynamic";
import { TutorialCarousel } from "./tutorial-carousel";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface Props {
  assignmentName?: string;
  topic: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
}

export default function AssignmentTutorialModal({ assignmentName, classroom, topic }: Props) {  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          variant="outlineSecondary">
            Help
        </Button>
      </DialogTrigger>
      <DialogContent 
        aria-describedby="tutorial-carousel"
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-3xl flex flex-col gap-4">
        <DialogTitle className="mb-2">
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
          <div className="flex flex-row items-center text-3xl font-semibold my-2">
            {assignmentName && `${assignmentName} - `} {topic}
          </div>
        </DialogTitle>
        <DialogDescription className="m-0 text-black mx-auto text-lg font-semibold">
          How to take the assignment?
        </DialogDescription>
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