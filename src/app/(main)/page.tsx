import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export default async function Home({}) {
  const { user } = await validateRequest();

  if(!user) {
    redirect(Paths.Login);
  }

  if(user.classroomId) {
    redirect(`${Paths.Classroom}${user.classroomId}`);
  } else {
    // Get list of available classrooms
    const classrooms = await api.classroom.getClassrooms.query();
    
    // If there are classrooms available, redirect to the first one
    if (classrooms && classrooms.length > 0 && classrooms[0]?.id) {
      redirect(`${Paths.Classroom}${classrooms[0].id}`);
    } else {
      // Otherwise redirect to onboarding
      redirect(Paths.Onboarding);
    }
  }
  
  return (
    <>
      <main className="flex flex-col p-16 gap-16" />
    </>
  );
};