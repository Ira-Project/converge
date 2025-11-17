'use client';
import { PasswordInput } from "@/components/password-input";
import { login } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";


export const LoginForm: React.FC = () => {

  const [state, formAction] = useActionState(login, null);

  return (
    <>
      <form action={formAction} className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="********"
            className="h-11"
          />
        </div>

        {state?.fieldError ? (
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {Object.values(state.fieldError).map((err) => (
              <li className="ml-4" key={err}>
                {err}
              </li>
            ))}
          </ul>
        ) : state?.formError ? (
          <p className="rounded-lg border bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {state?.formError}
          </p>
        ) : null}
        <SubmitButton className="w-full h-11">Log In</SubmitButton>
      </form>
    </>
  )
}