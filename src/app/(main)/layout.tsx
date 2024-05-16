import { type ReactNode } from "react";
import { Navbar } from '@/components/navbar';

const MainLayout = ({ modal, children }: { modal: ReactNode, children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div>{modal}</div>
      <div>{children}</div>
    </div>
  );
};

export default MainLayout;
