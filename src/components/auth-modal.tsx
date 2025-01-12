'use client';
import { Paths } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_TITLE } from "@/lib/constants";
import { GoogleSignIn } from "@/components/google-signin";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}


export default function AuthModal({ user }: { user: User | undefined }) {

  const [isOpen, setIsOpen] = useState(user ? false : true);

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
            <Link href={Paths.GoogleLogin}>
              <GoogleSignIn text="Login with Google"/>
            </Link>
            <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted" />
              <div className="mx-2 text-muted-foreground">or</div>
              <div className="flex-grow border-t border-muted" />
            </div>
            <LoginForm onSuccess={() => setIsOpen(false)}/>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
