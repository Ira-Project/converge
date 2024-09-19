import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentListSkeleton() {
  
  return (
    <ScrollArea className="my-auto h-full flex flex-col gap-4">
        <Skeleton className="w-1/2 h-52" />
        <Skeleton className="w-1/2 h-52" />
        <Skeleton className="w-1/2 h-52" />
    </ScrollArea>
  );
}


