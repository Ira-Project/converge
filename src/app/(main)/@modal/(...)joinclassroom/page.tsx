'use client';

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useRouter } from 'next/navigation'
import { useFormState } from "react-dom";


export default function Page( ) {

  const router = useRouter();

  // const [state, formAction] = useFormState(login, null);

  function onClose() {
    router.back();
  }

  return (
    <dialog
      className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="flex flex-row items-center">
            Join Classroom
            <Button className="ml-auto mt-auto" variant="ghost" size="icon" onClick={onClose}>
              <Cross1Icon />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Enter Classroom Code</Label>
              <Input
                required
                placeholder="Enter 5 digit alphanumeric code. Ex: 9XJU5"
                name="code"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Enter Teacher's Last Name</Label>
              <Input
                placeholder="We will use this to verify the classroom"
                name="teacher-name"
              />
            </div>
            {/* {state?.fieldError ? (
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
              ) : null} */}
            <SubmitButton className="w-fit ml-auto">Join Classroom</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </dialog>
  );
}