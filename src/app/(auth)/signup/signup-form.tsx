'use client';
import { PasswordInput } from "@/components/password-input";
import { signup } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

// The onSuccess prop is used to prevent a redirect to the verify email page
// and to specify a different success callback
// This is useful when the signup form is used in a modal

export const SignUpForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {

  const [state, formAction] = useActionState(signup, null);

  return (
    <>
      <form 
        action={(formData) => {
          formAction(formData);
          if (onSuccess) onSuccess();
        }}
        className="grid gap-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            placeholder="Enter your full name (optional)"
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

        {
          onSuccess && (
            <input type="hidden" name="modal" value="true" />
          )
        }
    

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