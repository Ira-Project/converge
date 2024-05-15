import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

 export default async function SignIn({}) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <main className="h-screen flex items-center justify-center">
        HOME
      </main>
    </>
  );
};