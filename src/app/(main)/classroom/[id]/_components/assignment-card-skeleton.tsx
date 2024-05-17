import {
  Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentCardSkeleton() {
  
  return (
    <Card className="w-full p-4">
      <div className="flex flex-row items-end">
        <div className="flex flex-col gap-4">
          <Skeleton className="w-72 h-6" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="ml-auto">
          <div className="flex flex-row items-center">
            <Skeleton className="w-72 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}


