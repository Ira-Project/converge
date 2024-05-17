import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { TabsGroup } from "./@tabs/_components/tabs-group";

const ClassroomTabLayout = async ({ 
  tabs, 
  params 
}:{ 
  children: ReactNode, 
  tabs: ReactNode,
  params: { id: string } 
}) => {
  
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const classroom = await api.classroom.get.query({
    id: params.id,
  });

  return (
    <main className="p-16">
      <div className="flex flex-col gap-8">
        <div className="flex row items-center">
          <Suspense fallback={ <Skeleton className="h-8 w-96" /> }>
            <p className="text-4xl font-semibold"> {classroom?.name} </p>
          </Suspense>
        </div>
        <TabsGroup id={params.id} role={user.role} />
        <Separator />
      </div>
      {tabs}
    </main>
  );
};

export default ClassroomTabLayout;
