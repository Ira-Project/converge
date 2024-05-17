import { api } from "@/trpc/server";
import { Person } from "./person";

export const TeacherList = async ({ id, showJoinedAt } : { id: string, showJoinedAt: boolean}) => {
  const teachers = await api.classroom.teachers.query({
    id: id
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Teachers</p>
      {teachers.map(teacher => (
        <div key={teacher.user.id}>
          <Person 
            key={teacher.user.id}
            name={teacher.user.name}
            avatar={teacher.user.avatar}
            joinedAt={showJoinedAt ? teacher.createdAt : undefined} />
        </div>
      ))}
    </div>
  );
}