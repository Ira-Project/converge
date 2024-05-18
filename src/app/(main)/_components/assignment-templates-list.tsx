import { Suspense } from "react";
import { api } from "@/trpc/server";
import { AssignmentTemplateCard } from "./assignment-template-card";
import { AssignmentTemplateCardSkeleton } from "./assignment-template-card-skeleton";

export const AssignmentTemplateList = async() => {

  const assignmentTemplates = await api.assignmentTemplate.list.query();  

  return (
    <>
      <Suspense fallback={ <AssignmentTemplateCardSkeleton /> }>
        <div className="flex flex-row flex-wrap gap-6"> 
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


