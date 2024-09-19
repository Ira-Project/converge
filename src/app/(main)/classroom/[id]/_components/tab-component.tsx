'use client';
import { PersonIcon, StackIcon } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paths } from "@/lib/constants";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";


export default function TabComponent({ id }: { id: string }) {

  const activeTab = useSelectedLayoutSegment('tabs');

  return (
    <Tabs 
      defaultValue={activeTab ?? "assignments"}>
      <TabsList className="h-10">
        <TabsTrigger value="assignments">
          <Link href={`${Paths.Classroom}${id}/`}>
            <div className="my-auto flex flex-row gap-2 text-md"> 
              <StackIcon className="my-auto" height={20} width={20}/>
              Assignments
            </div>
          </Link>
        </TabsTrigger>
          <Link href={`${Paths.Classroom}${id}/students`}>
            <TabsTrigger value="students">
              <div className="my-auto flex flex-row gap-2 text-md">
              <PersonIcon className="my-auto" height={20} width={20}/>
                Students
              </div>
            </TabsTrigger>
          </Link>   
      </TabsList>
    </Tabs>
  )
}