import { ClockIcon } from "@/components/icons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";

interface Props {
  assignmentName: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
  timeLimit?: number | null;
  numberOfQuestions: number;
}

export default function AssignmentHeader({ assignmentName, classroom, timeLimit, numberOfQuestions }: Props) {  

  return (
    <div className="flex flex-col gap-2">
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
            <BreadcrumbPage>Assignment</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-row items-center text-3xl font-semibold">
        {assignmentName}
      </div>
      <div className="text-muted-foreground text-xs flex flex-row gap-2 items-center">
        <ClockIcon />
        <p>
          {timeLimit ? `${timeLimit} minutes` : "No Time Limit"}
        </p>
        <p>|</p>
        <p>
          {numberOfQuestions} Questions
        </p>
      </div>
    </div>
  );
}