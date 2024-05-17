import {
  Card,
  CardDescription,
} from "@/components/ui/card";
import { CalendarIcon } from "@radix-ui/react-icons";

interface AssignmentCardProps {
  assignment: {
    id: string;
    name: string;
    dueDate: Date;
  };
}

export function AssignmentCard({ assignment } : AssignmentCardProps) {
  
  return (
    <Card className="w-full p-4">
      <div className="flex flex-row items-end">
        <div>
          <div className="text-lg font-semibold">
            {assignment.name}
          </div>
          Probability
        </div>
        <div className="ml-auto">
          <div className="flex flex-row items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <CardDescription>
              Due on {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(assignment.dueDate)}
            </CardDescription>
          </div>
        </div>
      </div>
    </Card>
  );
}


