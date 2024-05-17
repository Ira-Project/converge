import { Label } from "@/components/ui/label";
import { api } from "@/trpc/server";
import { CopyClassroomCode } from "./copy-classroom-code";

export const InviteStudents = async ({ id }: { id: string }) => {

  const classroom = await api.classroom.get.query({ id });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Invite Students</p>
      <p className="text-sm"> Share classroom code with your students</p>
      <Label>Classroom Code</Label>
      { classroom?.code && <CopyClassroomCode code={classroom.code} />}
    </div>
  );
}