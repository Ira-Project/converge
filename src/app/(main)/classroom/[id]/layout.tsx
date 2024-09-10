import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { TabsGroup } from "./@tabs/_components/tabs-group";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
    <main className="p-16 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={Paths.Home}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Classroom</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Suspense fallback={ <Skeleton className="h-8 w-96" /> }>
            <p className="text-2xl font-semibold"> {classroom?.course?.name}</p>
            <p className="text-md text-muted-foreground"> {classroom?.description} </p>
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
