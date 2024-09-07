import { api } from "@/trpc/server";
import CreateClassroomModal from "./_components/create-classroom-modal";

export default async function Page() {

  const courses = await api.subject.listCourses.query();  

  return (
    <CreateClassroomModal courses={courses} />    
  );
}