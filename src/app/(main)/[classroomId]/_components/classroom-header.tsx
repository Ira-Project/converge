import { Badge } from "@/components/ui/badge";
import { type RouterOutputs } from "@/trpc/shared";

interface ClassroomHeaderProps {
  classroom: RouterOutputs["classroom"]["get"];
}

export function ClassroomHeader({ classroom }: ClassroomHeaderProps) {
  return (
    <div 
      className="mb-8 h-32 fixed top-0 z-[5] w-full p-8 text-white"
      style={{ backgroundImage: `url('/images/cover.png')` }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold mb-1 mt-4">{classroom?.name}</h1>
        {classroom && !classroom.isActive && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 mt-3">
            Archived
          </Badge>
        )}
      </div>
      {classroom?.course && (
        <p className="text-sm">{classroom?.course?.subject?.name} | {classroom?.course?.name}</p>
      )}
    </div>
  );
} 