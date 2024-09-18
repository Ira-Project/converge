import { type ReactNode } from "react";

const AssignmentLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};

export default AssignmentLayout;
