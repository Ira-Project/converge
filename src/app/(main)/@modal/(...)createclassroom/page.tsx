import { api } from "@/trpc/server";
import CreateClassroomModal from "./_components/create-classroom-modal";

export default async function Page() {

  const subjects = await api.subject.list.query();  

  return (
    <CreateClassroomModal subjects={subjects} />    
  );
}