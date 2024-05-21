'use client';
import { PasswordInput } from "@/components/password-input";
import { signup } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Paths } from "@/lib/constants";

export const SignUpForm: React.FC = () => {

  const [state, formAction] = useFormState(signup, null);

  return (
    <>
      <form action={formAction} className="grid gap-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            required
            placeholder="Enter your full name"
            autoComplete="name"
            name="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            required
            placeholder="email@example.com"
            autoComplete="email"
            name="email"
            type="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Password</Label>
          <PasswordInput
            name="password"
            required
            autoComplete="current-password"
            placeholder="********"
          />
        </div>

        <div className="flex flex-wrap justify-between">
          <Button variant={"link"} size={"sm"} className="p-0" asChild>
            <Link href={Paths.Login}>
              Already signed up? Login instead.
            </Link>
          </Button>
        </div>

        {state?.fieldError ? (
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {Object.values(state.fieldError).map((err) => (
              <li className="ml-4" key={err}>
                {err}
              </li>
            ))}
          </ul>
        ) : state?.formError ? (
          <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {state?.formError}
          </p>
        ) : null}
        <SubmitButton className="w-full">Sign Up</SubmitButton>
      </form>
    </>
  )
}