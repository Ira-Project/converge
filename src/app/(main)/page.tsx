import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import posthog from "posthog-js";
import { redirect } from "next/navigation";

 export default async function Home({}) {

  const { user } = await validateRequest();

  if(!user) {
    redirect(Paths.Login);
  }

  if(user.classroomId) {
    redirect(`${Paths.Classroom}${user.classroomId}`);
  } else {
    redirect(Paths.Onboarding);
  }
  
  return (
    <>
      <main className="flex flex-col p-16 gap-16" />
    </>
  );
};