import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ClassroomCard } from "./classroom-card";
import { ClassroomCardSkeleton } from "./classroom-skeleton";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import Link from "next/link";
import { Roles } from "@/lib/constants";

export const ClassroomList = async({ role } :  { role: Roles} ) => {
  
  const classrooms = await api.classroom.list.query();
  
  return (
    <>
      <Suspense fallback={ <ClassroomCardSkeleton /> }>
        {
          classrooms.length > 0 ?
            <ScrollArea className="w-full whitespace-nowrap rounded-md overscroll-x-contain">
              <div className="flex flex-row gap-6 w-max pb-6"> 
                {classrooms?.map((classroom) => (
                  <div key={classroom.classroom.id} className="flex flex-row"> 
                    <ClassroomCard key={classroom.classroom.id} classroom={classroom.classroom} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          :
            role === Roles.Teacher ?
              <div className="text-muted-foreground flex flex-row"> 
                Don't have any classrooms yet.{" "}
                <Link href="/createclassroom" className="underline"> Create one </Link>
                {" "}to get started.
              </div>
            :
              <div className="text-muted-foreground flex flex-row"> 
                No classrooms to show.{" "}
                <Link href="/joinclassroom" className="underline"> Join one </Link>
                {" "}to get started.
              </div>
        }
      </Suspense>
    </>
  );
}


