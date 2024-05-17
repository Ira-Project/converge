import {
  Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentTemplateCardSkeleton( ) {
  return (
    <Card className="w-96 h-48 relative">
      <Skeleton className="absolute rounded-t-md top-0 left-0 w-96 h-32" />
      <Skeleton className="absolute bottom-4 left-4 w-32 h-6" />
    </Card>
  );
}


