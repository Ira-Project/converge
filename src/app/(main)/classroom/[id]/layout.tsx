import { Paths, Roles } from "@/lib/constants";
import { HomeIcon } from "@/components/icons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { InviteStudents } from "./_components/invite-students";

import Image from "next/image";
import { type ReactNode } from "react";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import TabComponent from "./_components/tab-component";

export default async function ClassroomPage(props: { tabs: ReactNode, params: Promise<{ id: string }> }) {
  const params = await props.params;

  const {
    tabs
  } = props;

  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const classroom = await api.classroom.get.query({ id: params.id });


  if(!classroom) redirect(Paths.Home);


  return (
    <div className="grid grid-cols-[0.45fr_0.55fr] gap-16 h-[calc(100vh-52px)] overflow-hidden max-w-screen-lg mx-auto">
      <div className="mt-[10%] flex flex-col gap-4">
        <div className="border-1 p-8 rounded-md flex flex-col gap-4 bg-iraYellowLight">
          <Image 
            style={{color: "#EF476F", fill: "#EF476F", stroke: "#EF476F"}}
            color="#EF476F"
            src={classroom?.course?.subject?.imageUrl ?? ""}
            width={100}
            height={100}
            alt={classroom?.course?.name ?? ""}
          />

          <div className="flex flex-col gap-2">
          <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={Paths.Home}>
                      <HomeIcon height={15} width={15}/>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <span className="text-md">
                        Classroom
                      </span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <h1 className="text-3xl">
              {classroom?.course?.name ?? classroom?.name}
            </h1>
            {
              user.role === Roles.Teacher &&
              <>
                <div className="flex flex-row gap-4 mt-2 text-lg my-auto">
                  <InviteStudents code={classroom.code} />
                </div>
                <div className="flex flex-row mt-8 gap-4 "> 
                  <TabComponent id={params.id}/>
                </div>
              </>
            }
          </div>
        </div>
      </div>
      { 
        tabs
      }
    </div>
  );
};