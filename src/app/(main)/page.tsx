import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ClassroomList } from "./_components.tsx/classroom-list";
import { AssignmentTemplateList } from "./_components.tsx/assignment-templates-list";

 export default async function Home({}) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <main className="flex flex-col p-16 gap-16">
        <div className="flex flex-col gap-4">
          <div className="flex row items-center">
            <p className="text-3xl font-semibold"> Classes </p>
            <Link 
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
          <Separator />
          <ClassroomList role={user.role} />
        </div>
        {
          user.role === Roles.Teacher &&
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-semibold"> Assignment Templates </p>
            <Separator />
            <AssignmentTemplateList />
          </div>
        }
      </main>
    </>
  );
};