import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Paths } from "@/lib/constants";

interface Props {
  assignmentName: string;
  classroom?: {
    name: string;
    id: string;
  } | null;
}

export default function AssignmentHeader({ assignmentName, classroom }: Props) {  

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
    </div>
  );
}