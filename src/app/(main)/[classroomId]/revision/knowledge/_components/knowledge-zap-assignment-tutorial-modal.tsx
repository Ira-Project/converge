'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ActivityType, Paths } from "@/lib/constants";
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface Props {
  classroomId: string;
  isMobileLayout?: boolean;
}

export default function AssignmentTutorialModal({ classroomId, isMobileLayout = false }: Props) {  

  const { tutorialUrl } = getMetaDataFromActivityType(ActivityType.KnowledgeZap, "");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Only set defaultOpen if this modal matches the current screen size
  const shouldOpenByDefault = isMobileLayout ? isMobile : !isMobile;

  return (
    <Dialog defaultOpen={shouldOpenByDefault} onOpenChange={(open) => {
      if (open) {
        posthog.capture("knowledge_zap_tutorial_opened");
      } else {
        posthog.capture("knowledge_zap_tutorial_closed");
      }
    }}>
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
          <div className="flex flex-row items-center text-xl font-semibold my-2 text-lime-700">
            Revision
          </div>
        </DialogTitle>
        <DialogDescription className="m-0 mx-auto font-medium">
          How to do the activity?
        </DialogDescription>
        <DialogDescription className="m-0 mx-auto px-4 md:px-16 font-small text-center">
          This activity will help you revise your weakest concepts and introduce you to new concepts that you haven't attempted yet. Our algorithm will keep track of your progress and generate new questions for you based on your performance. You can take this activity as many times as you want to keep practicing. 
        </DialogDescription>
        <div>
          <div className="relative pb-[56.19%] h-0 border-0">
            <iframe 
              src={tutorialUrl} 
              className="absolute w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-lime-700 text-white hover:bg-lime-900">
              Start Activity
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}