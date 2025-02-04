'use client';
import { Paths } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_TITLE } from "@/lib/constants";
import { GoogleSignIn } from "@/components/google-signin";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { SignUpForm } from "@/app/(auth)/signup/signup-form";
import { VerifyCode } from "@/app/(auth)/verify-email/verify-code";
import { SendResetEmail } from "@/app/(auth)/reset-password/send-reset-email";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: string | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

type AuthMode = 'login' | 'signup' | 'verify' | 'reset';

export default function AuthModal({ user, mode = 'login' }: { 
  user?: User | null;
  mode?: AuthMode;
}) {
  const [isOpen, setIsOpen] = useState(user ? false : true);
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [googleLoginPath, setGoogleLoginPath] = useState<string>(Paths.GoogleLogin);

  useEffect(() => {
    if (isOpen && window.location.pathname !== '/') {
      document.cookie = `returnPath=${window.location.pathname};`;
      setGoogleLoginPath(`${Paths.GoogleLogin}?returnPath=${window.location.pathname}`);
    }
  }, [isOpen]);
  

  const renderContent = () => {
    switch (currentMode) {
      case 'verify':
        return (
          <>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>
              Verification code was sent to <strong>{user?.email}</strong>. Check
              your spam folder if you can't find the email.
            </CardDescription>
            <VerifyCode />
          </>
        );
      case 'reset':
        return (
          <>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>
              Password reset link will be sent to your email.
            </CardDescription>
            <SendResetEmail />
          </>
        );
      case 'signup':
        return (
          <>
            <Link href={googleLoginPath}>
              <GoogleSignIn text="Sign Up with Google"/>
            </Link>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-muted" />
              <div className="mx-2 text-muted-foreground">or</div>
              <div className="flex-grow border-t border-muted" />
            </div>
            <SignUpForm onSuccess={() => setCurrentMode('verify')} />
            <div className="flex flex-wrap justify-between">
              <Button variant={"link"} size={"sm"} className="p-0" asChild onClick={() => setCurrentMode('login')}>
                <p>Already signed up? Login instead.</p>
              </Button>
            </div>
          </>
        );
      default: // login
        return (
          <>
            <Link href={googleLoginPath}>
              <GoogleSignIn text="Login with Google"/>
            </Link>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-muted" />
              <div className="mx-2 text-muted-foreground">or</div>
              <div className="flex-grow border-t border-muted" />
            </div>
            <LoginForm />
            <div className="flex flex-wrap justify-between">
              <Button variant={"link"} size={"sm"} className="p-0" asChild onClick={() => setCurrentMode('signup')}>
                <p>Not signed up? Sign up now.</p>
              </Button>
              <Button variant={"link"} size={"sm"} className="p-0" asChild onClick={() => setCurrentMode('reset')}>
                <p>Forgot password?</p>
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogTitle />
      <DialogContent className="sm:max-w-[400px]" hideCloseButton>
        <Card className="w-full border-none shadow-none">
          <CardHeader className="flex items-center mb-4">
            <Image src="/images/logo.png" alt="Ira Logo" width={48} height={48} />
            <CardTitle>{APP_TITLE}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
