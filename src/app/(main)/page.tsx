import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import PostHogClient from "@/lib/posthog";
import { redirect } from "next/navigation";

 export default async function Home({}) {

  const { user } = await validateRequest();

  if(!user) {
    redirect(Paths.Login);
  } else {

    const posthog = PostHogClient();
    posthog.identify({
      distinctId: user.id,
      properties: {
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
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