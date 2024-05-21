import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Paths, Roles } from "@/lib/constants";
import Link from "next/link";

interface ClassroomCardProps {
  classroom: {
    id: string;
    name: string;
    description?: string | null;
    subject: {
      name: string;
    } | null;
    classroomMembers: {
      role: Roles;
    }[];
  };
}

export function ClassroomCard({ classroom } : ClassroomCardProps) {

  const numberOfStudents = classroom.classroomMembers.filter(member => member.role === Roles.Student).length;
  return (
    <Link href={`${Paths.Classroom}${classroom.id}`}>
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{classroom.name}</CardTitle>
          <CardTitle>{classroom.subject?.name ? classroom.subject?.name : "_"}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2">
            {classroom?.description}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <CardDescription>
            {numberOfStudents} {numberOfStudents === 1 ? "student" : "students"} joined
          </CardDescription>
        </CardFooter>
      </Card>
    </Link>
  );
}


