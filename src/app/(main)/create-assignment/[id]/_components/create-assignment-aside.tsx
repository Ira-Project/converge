import { api } from "@/trpc/server"
import { CreateFullAssignmentForm } from "./create-full-assignment-form"

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/back-button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ConceptGraph = dynamic(
  () => import("../../../../../components/concept-graph").then((mod) => mod.ConceptGraph),
  {
    ssr: false,
  }
);

interface Props {
  id: string;
}

export const CreateAssignmentAside = async ( {id } : Props ) => {

  const classrooms = await api.classroom.list.query();
  const assignmentTemplate = await api.assignmentTemplate.get.query({ id });

  return (
    <div className="w-96 bg-background z-20 fixed left-0 top-0 h-screen gap-4 shadow-md">
      <ScrollArea className="overflow-y-auto pr-4">
        <div className="flex flex-col gap-4 py-6 pl-6 pr-2">
          <BackButton className="text-muted-foreground p-0 text-left mr-auto" variant="link"> ← Back </BackButton>
          <p className="text-lg font-semibold"> Create Assignment </p>
          <Suspense fallback={<Skeleton className="w-full h-8" />}>
            <CreateFullAssignmentForm classrooms={classrooms} assignmentTemplateId={id} />
          </Suspense>
          <Suspense fallback={<Skeleton className="w-full h-60" />}>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold"> Concept Graph </p>
              <div className="w-[336px] h-48 border p-2 rounded-md">
                <ConceptGraph assignmentTemplate={assignmentTemplate} />
              </div>
            </div>
          </Suspense>
        </div>
      </ScrollArea>
    </div>
  )
}