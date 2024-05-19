import { api } from "@/trpc/server"
import { CreateFullAssignmentForm } from "./create-full-assignment-form"

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";

const ConceptGraph = dynamic(
  () => import("./concept-graph").then((mod) => mod.ConceptGraph),
  {
    ssr: false,
  }
);

export const CreateAssignmentAside = async ( { id } : { id: string}) => {

  const classrooms = await api.classroom.list.query();
  const assignmentTemplate = await api.assignmentTemplate.get.query({ id });

  if(!assignmentTemplate) redirect(Paths.Login);

  return (
    <div className="w-96 bg-white z-20 fixed left-0 top-0 h-screen flex flex-col p-6 gap-8 shadow-md">
        <p className="text-lg font-semibold"> Create Assignment </p>
        <Suspense fallback={<Skeleton className="w-full h-8" />}>
          <CreateFullAssignmentForm classrooms={classrooms} conceptGraphId={assignmentTemplate.conceptGraphs.id} />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-60" />}>
          <ConceptGraph assignmentTemplate={assignmentTemplate} />
        </Suspense>
    </div>
  )
}