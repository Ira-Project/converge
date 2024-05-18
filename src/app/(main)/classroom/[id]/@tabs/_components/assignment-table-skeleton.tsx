import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function AssignmentTableSkeleton() {
  
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-1/3 h-6" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-1/2 h-6" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-1/2 h-6" />
      </TableCell>
    </TableRow>
  );
}


