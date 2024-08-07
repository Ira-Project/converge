import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClassroomList } from "./_components/classroom-list";
import { AssignmentTemplateList } from "./_components/assignment-templates-list";
import { PlusIcon } from "@/components/icons";

 export default async function Home({}) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <main className="flex flex-col p-16 gap-16">
        <section className="flex flex-col gap-6">
          <div className="flex row items-center">
            <p className="text-3xl font-semibold"> Classes </p>
            <Link
              prefetch={true} 
              href={
                user.role === Roles.Teacher ? "/createclassroom" : "/joinclassroom"
              } 
              scroll={false}
              className="ml-auto">
              <Button variant="outline"> 
                <PlusIcon className="mr-2 h-4 w-4" />
                {user.role === Roles.Teacher ? "Create Classroom" : "Join Classroom"}
              </Button>
            </Link>
          </div>
          <ClassroomList role={user.role} />
        </section>
        {
          user.role === Roles.Teacher &&
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-semibold"> Assignment Templates </p>
            </div>
            <AssignmentTemplateList />
          </section>
        }
      </main>
    </>
  );
};