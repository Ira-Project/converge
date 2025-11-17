"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { sendPasswordResetLink } from "@/lib/auth/actions";
import { ExclamationTriangleIcon } from "@/components/icons";
import { Paths } from "@/lib/constants";

export function SendResetEmail() {
  const [state, formAction] = useActionState(sendPasswordResetLink, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast("A password reset link has been sent to your email.");
      router.push(Paths.Login);
    }
    if (state?.error) {
      toast(state.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [state?.error, state?.success]);

  return (
    <form className="space-y-6" action={formAction}>
      <div className="space-y-2">
        <Label htmlFor="email">Your Email</Label>
        <Input
          id="email"
          required
          placeholder="email@example.com"
          autoComplete="email"
          name="email"
          type="email"
          className="h-11"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-2">
        <Link href={Paths.Signup}>
          <Button variant={"link"} size={"sm"} className="p-0 h-auto text-sm">
            Not signed up? Sign up now
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <SubmitButton className="w-full h-11">Reset Password</SubmitButton>
        <Button variant="outline" className="w-full h-11" asChild>
          <Link href={Paths.Login}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
