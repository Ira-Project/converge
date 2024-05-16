import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

 export default async function SignIn({}) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  
  return (
    <>
      <main className="p-16">
        <div className="flex flex-col gap-8">
          <div className="flex row items-center">
            <p className="text-4xl font-semibold"> Inside Classroom </p>
          </div>
          <Separator />
        </div>
      </main>
    </>
  );
};