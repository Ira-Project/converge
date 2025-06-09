import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {children}
    </main>
  );
};

export default AuthLayout;
