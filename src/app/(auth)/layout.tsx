import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="h-screen flex items-center justify-center">
      {children}
    </main>
  );
};

export default AuthLayout;
