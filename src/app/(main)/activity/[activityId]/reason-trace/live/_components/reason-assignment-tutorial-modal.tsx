'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface Props {
  topic: string;
  classroomId: string;
}

export default function AssignmentTutorialModal({ classroomId, topic }: Props) {  

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
                  href={`${Paths.Classroom}${classroomId}`}>
                    Classroom
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Activity</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-row items-center text-xl font-semibold my-2 text-rose-700">
            {topic}
          </div>
        </DialogTitle>
        <DialogDescription className="m-0 mx-auto font-medium">
          How to do the activity?
        </DialogDescription>
        <div className="px-16">
          <div className="relative pb-[56.19%] h-0 border-0">
            <iframe 
              src="https://www.loom.com/embed/07854dffdd974dc3b4de0a2754fe1f56?sid=41fd0084-22cc-4e8d-9b17-675d99ebd8c8" 
              className="absolute w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-rose-700 text-white hover:bg-rose-900">
              Start Activity
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}