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

export const metadata = {
  title: "A Few More Details",
  description: "A Few More Details",
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);

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
      </CardContent>
    </Card>
  );
}
