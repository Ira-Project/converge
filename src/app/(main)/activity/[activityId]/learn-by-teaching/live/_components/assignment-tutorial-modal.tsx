'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
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
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          variant="link">
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
                <BreadcrumbPage>Activity</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-row items-center text-xl font-semibold my-2 text-amber-700">
            {assignmentName && `${assignmentName} - `} {topic}
          </div>
        </DialogTitle>
        <DialogDescription className="m-0 mx-auto font-medium">
          How to take the assignment?
        </DialogDescription>
        <div className="px-16">
          {/* <TutorialCarousel /> */}
          <div className="relative pb-[57.02%] h-0 border-0">
            <iframe 
              src="https://www.loom.com/embed/307a3d4d5b764eadb430e488aff50f7d?sid=bdbf8333-2c42-44d2-8bcf-210c9dea8d5e" 
              className="absolute w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-amber-700 text-white hover:bg-amber-900">
              Start Assignment
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}