'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface Props {
  topic: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
}

export default function AssignmentTutorialModal({ classroom, topic }: Props) {  

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
            {topic}
          </div>
        </DialogTitle>
        <DialogDescription className="m-0 mx-auto font-medium">
          How to do the activity?
        </DialogDescription>
        <div className="px-16">
          <div className="relative pb-[56%] h-0 border-0">
            <iframe 
              src="https://www.loom.com/embed/e07673e5101d48d9bd12ff88259e7de3?sid=f3cd2e10-1062-4bc1-bf1a-d31035554101" 
              className="absolute w-full h-full" 
              allowFullScreen
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-amber-700 text-white hover:bg-amber-900">
              Start Activity
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}