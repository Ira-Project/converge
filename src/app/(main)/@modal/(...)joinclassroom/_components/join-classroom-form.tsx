'use client';

import { Input } from "@/components/ui/input";
import { joinClassroomSchema } from "@/server/api/routers/classroom/classroom.input";
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { revalidateClassroomListQuery } from "../../_actions/revalidateCache";
import { Paths } from "@/lib/constants";

export const JoinClassroomForm = () => {

  const router = useRouter();

  const joinClassroom = api.classroom.join.useMutation();
  const form = useForm({
    defaultValues: {
      code: "",
      name: "",
    },
    resolver: zodResolver(joinClassroomSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const id = await joinClassroom.mutateAsync({...values});
    await revalidateClassroomListQuery();
    router.replace(`${Paths.Classroom}${id}`)
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classroom Code</FormLabel>
              <FormControl>
                <Input {...field} required placeholder="Enter 5 digit alphanumeric code. Ex: 9XJU5"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher's Name</FormLabel>
              <FormControl>
                <Input {...field} required placeholder="Enter your teacher's full name"/>
              </FormControl>
              <FormDescription>
                We will use your teacher's name to verify the classroom.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        {
          joinClassroom.error &&
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {joinClassroom.error.message}
          </ul>
        }

        
        <LoadingButton 
          disabled={!form.formState.isDirty}
          loading={joinClassroom.isLoading}
          className="w-fit ml-auto">
            Join Classroom
        </LoadingButton>
      </form>
    </Form>
  );
}