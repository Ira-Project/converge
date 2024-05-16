import { validateRequest } from "@/lib/auth/validate-request";
import { Paths, Roles } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { api } from "@/trpc/server";
import { Suspense } from "react";
import { ClassroomCard } from "./_components.tsx/classroom-card";
import { ClassroomCardSkeleton } from "./_components.tsx/classroom-skeleton";
import Link from "next/link";

 export default async function SignIn({}) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const classrooms = await api.classroom.list.query();
  
  return (
    <>
      <main className="p-16">
        <div className="flex flex-col gap-8">
          <div className="flex row items-center">
            <p className="text-4xl font-semibold"> Classes </p>
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
          <Suspense fallback={ <ClassroomCardSkeleton /> }>
            <div className="flex flex-row gap-6 max-w-full overflow-x-scroll"> 
              {classrooms?.map((classroom) => (
                <div key={classroom.classroom.id} className="flex flex-row"> 
                  <ClassroomCard key={classroom.classroom.id} classroom={classroom.classroom} />
                </div>
              ))}
            </div>
        </Suspense>
        </div>
      </main>
    </>
  );
};