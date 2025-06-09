import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_TITLE } from "@/lib/constants";
import { LoginForm } from "./login-form";
import { GoogleSignIn } from "../../../components/google-signin";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user?.classroomId) redirect(`${Paths.Classroom}${user.classroomId}`);    
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex items-center mb-4">
        <Image src="/images/logo.png" alt="Ira Logo" width={48} height={48} />
        <CardTitle className="text-center">{APP_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href={Paths.GoogleLogin}>
          <GoogleSignIn text="Login with Google"/>
        </Link>
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground text-sm">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>
        <LoginForm />
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-2">
          <Button variant={"link"} size={"sm"} className="p-0 h-auto text-sm" asChild>
            <Link href={Paths.Signup}>Not signed up? Sign up now.</Link>
          </Button>
          <Button variant={"link"} size={"sm"} className="p-0 h-auto text-sm" asChild>
            <Link href={Paths.ResetPassword}>Forgot password?</Link>
          </Button>
        </div>  
      </CardContent>
    </Card>
  );
}
