import { Suspense } from "react";
import { api } from "@/trpc/server";
import { AssignmentCardSkeleton } from "../classroom/[id]/@tabs/_components/assignment-card-skeleton";
import { AssignmentTemplateCard } from "./assignment-template-card";

export const AssignmentTemplateList = async() => {

  const assignmentTemplates = await api.assignmentTemplate.list.query();  
  return (
    <>
      <Suspense fallback={ <AssignmentCardSkeleton /> }>
        <div className="flex flex-row flex-wrap"> 
          {assignmentTemplates?.map((assignmentTemplate) => (
            <div key={assignmentTemplate.id}> 
              <AssignmentTemplateCard {...assignmentTemplate} />
            </div>
          ))}
        </div>
      </Suspense>
    </>
  );
}


