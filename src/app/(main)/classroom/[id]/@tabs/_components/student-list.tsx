import { api } from "@/trpc/server";
import { Person } from "./person";

export const StudentsList = async ({ id, showJoinedAt } : { id: string, showJoinedAt: boolean}) => {
  const students = await api.classroom.students.query({
    id: id
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Students</p>
      {students.map(student => (
        <div key={student.user.id}>
          <Person 
            key={student.user.id}
            name={student.user.name}
            avatar={student.user.avatar}
            joinedAt={showJoinedAt ? student.createdAt : undefined} />
        </div>
      ))}
    </div>
  );
}