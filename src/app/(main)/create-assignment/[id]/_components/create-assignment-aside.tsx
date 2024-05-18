import { api } from "@/trpc/server"
import { CreateFullAssignmentForm } from "./create-full-assignment-form"
import { ConceptGraph } from "./concept-graph";

export const CreateAssignmentAside = async ( { id } : { id: string}) => {

  const classrooms = await api.classroom.list.query();
  const assignmentTemplate = await api.assignmentTemplate.get.query({ id });

  return (
    <div className="w-96 bg-white z-20 fixed left-0 top-0 h-screen flex flex-col p-6 gap-8 shadow-md">
        <p className="text-lg font-semibold mb-8"> Create Assignment </p>
        <CreateFullAssignmentForm classrooms={classrooms}/>
        {
          assignmentTemplate &&  
          <ConceptGraph assignmentTemplate={assignmentTemplate} />
        }
    </div>
  )
}