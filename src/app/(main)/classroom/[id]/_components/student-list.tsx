import { Person } from "./person";
import { type RouterOutputs } from "@/trpc/shared";

export const StudentsList = async (
  { 
    students, 
    showJoinedAt 
  } : 
  { 
    students: RouterOutputs["classroom"]["students"], 
    showJoinedAt: boolean
  }
) => {

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Students</p>
      {
        students.length === 0 && 
        <p>No students have joined yet. Share the classroom code to invite them.</p>
      }
      {students.map(student => (
        <div key={student.user.id}>
          <Person 
            key={student.user.id}
            name={student.user.name ?? undefined}
            avatar={student.user.avatar}
            joinedAt={showJoinedAt ? student.createdAt : undefined} />
        </div>
      ))}
    </div>
  );
}