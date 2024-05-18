import type { RouterOutputs } from "@/trpc/shared";

interface Props {
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"];
}

export const ConceptGraph = (
  { assignmentTemplate } : Props
) => {



  return (
    <div className="flex flex-col gap-4">
      HELLO
    </div>
  )
}

