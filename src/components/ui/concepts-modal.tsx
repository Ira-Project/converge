'use client'
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths, type ActivityType } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils";
import { cn } from "@/lib/utils";
import { AnimatedSpinner } from "@/components/icons";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

const Dialog = dynamic(() => import('@/components/ui/dialog').then((mod) => mod.Dialog), { ssr: false });

interface ConceptsModalProps {
  topic: string;
  classroomId: string;
  concepts: Array<{
    id: string;
    text: string;
    answerText?: string | null;
  }>;
  activityType: string;
  modalTriggerClassName?: string;
  isLoading?: boolean;
  isMobileLayout?: boolean;
}

export default function ConceptsModal({ 
  topic, 
  classroomId, 
  concepts, 
  activityType,
  modalTriggerClassName = "",
  isLoading = false,
  isMobileLayout = false
}: ConceptsModalProps) {  

  const { colour } = getMetaDataFromActivityType(activityType as ActivityType);
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
        posthog.capture("concepts_modal_opened");
      } else {
        posthog.capture("concepts_modal_closed");
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          variant="link"
          className={modalTriggerClassName}>
            Concepts
        </Button>
      </DialogTrigger>
      <DialogContent 
        aria-describedby="concepts-list"
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-4xl flex flex-col h-[80vh]">
        <div className="flex-shrink-0">
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
            <div className={cn(
              "flex flex-row items-center text-xl font-semibold my-2",
              {
                "text-amber-700": colour === "amber",
                "text-rose-700": colour === "rose",
                "text-lime-700": colour === "lime",
                "text-teal-700": colour === "teal",
                "text-fuchsia-700": colour === "fuchsia",
                "text-blue-700": colour === "blue",
              }
            )}>
              {topic}
            </div>
          </DialogTitle>
          <DialogDescription className="m-0 mx-auto font-medium text-lg mb-4">
            Concepts covered in this assignment
          </DialogDescription>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AnimatedSpinner className="h-8 w-8 mx-auto mb-4" />
                  <p className="text-gray-500">Loading concepts...</p>
                </CardContent>
              </Card>
            ) : concepts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No concepts found for this assignment.</p>
                </CardContent>
              </Card>
            ) : (
              concepts.map((concept, index) => (
                <Card key={concept.id} className={cn(
                  "border-l-4",
                  {
                    "border-l-amber-500": colour === "amber",
                    "border-l-rose-500": colour === "rose",
                    "border-l-lime-500": colour === "lime",
                    "border-l-teal-500": colour === "teal",
                    "border-l-fuchsia-500": colour === "fuchsia",
                    "border-l-blue-500": colour === "blue",
                  }
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        {
                          "bg-amber-100": colour === "amber",
                          "bg-rose-100": colour === "rose",
                          "bg-lime-100": colour === "lime",
                          "bg-teal-100": colour === "teal",
                          "bg-fuchsia-100": colour === "fuchsia",
                          "bg-blue-100": colour === "blue",
                        }
                      )}>
                        <span className={cn(
                          "font-semibold text-sm",
                          {
                            "text-amber-700": colour === "amber",
                            "text-rose-700": colour === "rose",
                            "text-lime-700": colour === "lime",
                            "text-teal-700": colour === "teal",
                            "text-fuchsia-700": colour === "fuchsia",
                            "text-blue-700": colour === "blue",
                          }
                        )}>{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {concept.text}
                        </h3>
                        {concept.answerText && (
                          <>
                            <Separator className="my-2" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {concept.answerText}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-6 pt-4 border-t">
          <DialogClose asChild>
            <Button className={cn(
              "text-white",
              {
                "bg-amber-700 hover:bg-amber-900": colour === "amber",
                "bg-rose-700 hover:bg-rose-900": colour === "rose",
                "bg-lime-700 hover:bg-lime-900": colour === "lime",
                "bg-teal-700 hover:bg-teal-900": colour === "teal",
                "bg-fuchsia-700 hover:bg-fuchsia-900": colour === "fuchsia",
                "bg-blue-700 hover:bg-blue-900": colour === "blue",
              }
            )}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 