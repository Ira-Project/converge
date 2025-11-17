"use client"

import { Badge } from "@/components/ui/badge";
import { type RouterOutputs } from "@/trpc/shared";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paths } from "@/lib/constants";

interface ClassroomHeaderProps {
  classroom: RouterOutputs["classroom"]["get"];
}

export function ClassroomHeader({ classroom }: ClassroomHeaderProps) {
  const pathname = usePathname();
  const isSettingsPage = pathname?.includes("/settings");
  
  const hasCourseInfo = classroom?.course?.subject?.name ?? classroom?.course?.name;
  const hasGradeInfo = classroom?.gradeText;
  const hasAnyInfo = hasCourseInfo ?? hasGradeInfo;

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
      <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm">
        {hasAnyInfo ? (
          <>
            {hasCourseInfo && (
              <span>{classroom?.course?.subject?.name} | {classroom?.course?.name}</span>
            )}
            {hasCourseInfo && hasGradeInfo && (
              <span>|</span>
            )}
            {hasGradeInfo && (
              <span>Grade {classroom.gradeText}</span>
            )}
            {!isSettingsPage && (
              <Link 
                href={`/${classroom?.id}${Paths.Settings}`}
                className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                title="Edit classroom settings"
              >
                <Pencil className="h-3 w-3" />
              </Link>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white/70 italic">No course or grade information set</span>
            {!isSettingsPage && (
              <Link 
                href={`/${classroom?.id}${Paths.Settings}`}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Add classroom information"
              >
                <Pencil className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 