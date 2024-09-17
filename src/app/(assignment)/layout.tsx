import { type ReactNode } from "react";

const AssignmentLayout = ({ modal, children }: { modal: ReactNode, children: ReactNode }) => {
  return (
    <div>
      <div>{modal}</div>
      <div>{children}</div>
    </div>
  );
};

export default AssignmentLayout;
