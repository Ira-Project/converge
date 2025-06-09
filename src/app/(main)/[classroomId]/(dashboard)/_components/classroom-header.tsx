import { Badge } from "@/components/ui/badge";
import { type RouterOutputs } from "@/trpc/shared";

interface ClassroomHeaderProps {
  classroom: RouterOutputs["classroom"]["get"];
}

export function ClassroomHeader({ classroom }: ClassroomHeaderProps) {
  return (
    <div 
      className="h-24 md:h-32 fixed top-0 z-[5] w-full p-4 md:p-8 text-white flex flex-col justify-center"
      style={{ backgroundImage: `url('/images/cover.png')` }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <h1 className="text-lg md:text-2xl font-semibold">{classroom?.name}</h1>
        {classroom && !classroom.isActive && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
            Archived
          </Badge>
        )}
      </div>
      {classroom?.course && (
        <p className="text-xs md:text-sm">{classroom?.course?.subject?.name} | {classroom?.course?.name}</p>
      )}
    </div>
  );
} 