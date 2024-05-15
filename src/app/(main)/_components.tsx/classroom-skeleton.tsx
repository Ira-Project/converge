import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export function ClassroomCardSkeleton( ) {
  return (
    <Card className="w-96">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-80" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-5 w-36" />
      </CardFooter>
    </Card>
  );
}


