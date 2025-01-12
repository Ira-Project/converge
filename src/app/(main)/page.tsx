
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

 export default async function Home({}) {

  // if (user?.isOnboarded) {
  //   redirect(`${Paths.Classroom}${user?.classroomId}`);
  // } else {
  //   redirect(Paths.Onboarding);
  // }
  
  return (
    <>
      <main className="flex flex-col p-16 gap-16" />
    </>
  );
};