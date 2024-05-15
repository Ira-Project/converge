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
import { LoginForm } from "./_components/login-form";
import { GoogleSignIn } from "../../../components/google-signin";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect(Paths.Home);    
  
  return (
    <Card className="w-[400px]">
      <CardHeader className="flex items-center mb-4">
        <Image src="/logo.png" alt="Ira Logo" width={48} height={48} />
        <CardTitle>{APP_TITLE}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link href="/login/google">
          <GoogleSignIn text="Login with Google"/>
        </Link>
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
