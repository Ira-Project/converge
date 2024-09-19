'use client'
import { Paths, Roles } from "@/lib/constants";
import { AssignmentList } from "./assignment-list";
import { HomeIcon, PersonIcon, StackIcon } from "@/components/icons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { InviteStudents } from "./invite-students";

import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { StudentsList } from "./student-list";
import { type RouterOutputs } from "@/trpc/shared";

interface Props {
  code: string;
  role: Roles;
  classroom: RouterOutputs['classroom']['get'];
  assignments: RouterOutputs['assignment']['list'];
  students: RouterOutputs['classroom']['students'];
}

export default function ClassroomPage({ code, classroom, assignments, students, role } : Props) {
  
  const [activeTab, setActiveTab] = useState("assignments");

  
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
            <div className="flex flex-row gap-4 mt-2 text-lg my-auto">
              <InviteStudents code={code} />
            </div>
            <div className="flex flex-row mt-8 gap-4 ">
              <Tabs 
                defaultValue="assignments"
                onValueChange={(value) => setActiveTab(value) }>
                <TabsList className="h-10">
                  <TabsTrigger value="assignments">
                    <div className="my-auto flex flex-row gap-2 text-md"> 
                      <StackIcon className="my-auto" height={20} width={20}/>
                      {assignments.assignmentList.length} Assignments
                    </div>
                  </TabsTrigger>
                    { 
                      role === Roles.Teacher && 
                      <TabsTrigger value="people">
                        <div className="my-auto flex flex-row gap-2 text-md">
                        <PersonIcon className="my-auto" height={20} width={20}/>
                          {students.length} Students
                        </div>
                      </TabsTrigger>
                    }   
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      { 
        activeTab === "people" ?
        <StudentsList students={students} showJoinedAt={true} />
        :
        <div className="max-h-full overflow-hidden mt-[20%]">
          <AssignmentList assignments={assignments} role={role} />
        </div>
      }
    </div>
  );
};