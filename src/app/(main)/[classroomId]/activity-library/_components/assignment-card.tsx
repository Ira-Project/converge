import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ActivityType, Paths, Roles } from "@/lib/constants";
import { ExternalLinkIcon } from "@/components/icons";
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils";
import { formatDateShort } from "@/lib/utils";
import type { Assignment } from "../types";

interface AssignmentCardProps {
  assignment: Assignment;
  role: Roles;
  classroomId: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, role, classroomId }) => {
  const { id, typeText, dueDate, name, description } = assignment;
  const { url, iconImage, title, colour, description: activityDescription } = getMetaDataFromActivityType(typeText ?? undefined, id);

  // For assignments, we need to create activities first before they can be accessed
  // So we'll link to a placeholder or creation page
  const assignmentUrl = `/${classroomId}/activity-library/assignment/${id}`;

  return (
    <div className="border rounded-2xl p-6 w-full min-w-[300px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Image src={iconImage} alt={title} width={60} height={60} />
        </div>
      </div>
      <div className={cn(
        "flex text-md my-auto font-bold",
        {
          "text-amber-700": colour === "amber",
          "text-rose-700": colour === "rose",
          "text-lime-700": colour === "lime",
          "text-teal-700": colour === "teal",
          "text-fuchsia-700": colour === "fuchsia",
          "text-blue-700": colour === "blue",
        }
      )}> 
        {title}
      </div>
      <h4 className="font-medium text-lg mt-2 mb-4 flex items-center">
        {name || "Untitled Assignment"}
      </h4>
      
      <p className="text-sm text-muted-foreground mb-4 h-[60px] line-clamp-3">
        {description || activityDescription}
      </p>
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-500">
          {dueDate ? formatDateShort(new Date(dueDate)) : "No due date"}
        </span>
      </div>
      <div className="flex gap-3 my-auto items-start vertical-align-middle">
        <Link href={assignmentUrl} className="p-0 underline text-xs my-auto">
          { role === Roles.Teacher ? "Create Activity" : "View Assignment"}
        </Link>
        <Link href={assignmentUrl} className="my-auto mx-2">
          <ExternalLinkIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default AssignmentCard; 