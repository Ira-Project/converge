import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";
import { UpdateUserForm } from "./update-user-form";
import { SubmitButton } from "@/components/submit-button";
import { logout } from "@/lib/auth/actions";

export const metadata = {
  title: "A Few More Details",
  description: "A Few More Details",
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);

  if (user.isOnboarded) redirect(`${Paths.Classroom}${user.classroomId}`);

  const courses = await api.subject.listCourses.query();
  const subjects = await api.subject.listSubjects.query();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>A Few More Details</CardTitle>
        <CardDescription>
          Just need a few more details from you so we can get to know you better!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateUserForm 
          courses={courses} 
          subjects={subjects} 
          email={user.email} 
          name={user.name ?? undefined} />
        <form action={logout}>
          <SubmitButton variant="link" className="p-0 font-normal w-full mt-2 text-center text-muted-foreground">
            Want to use a different email? Log out now.
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
