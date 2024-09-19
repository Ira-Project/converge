import { CopyClassroomCode } from "./copy-classroom-code";

export const InviteStudents = async ({ code }: { code?: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold">Invite Students</p>
      <p className="text-sm"> Share classroom code</p>
      { code && <CopyClassroomCode code={code} />}
    </div>
  );
}