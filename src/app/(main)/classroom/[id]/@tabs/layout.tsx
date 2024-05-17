import type { ReactNode } from "react";

const ClassroomLayout = ({ people, assignment, children }: 
  { people: ReactNode, assignment: ReactNode, children: ReactNode }) => {

  return (
    <div>
      <div>{people}</div>
      <div>{assignment}</div>
      <div>{children}</div>
    </div>
  );
};

export default ClassroomLayout;
