import { type ReactNode } from "react";
import { Navbar } from '@/components/navbar';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;
