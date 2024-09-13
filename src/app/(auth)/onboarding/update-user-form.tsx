"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { Paths } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";
import { updateUserSchema } from "@/server/api/routers/preloadedUsers/preloadedUsers.input";
import { useEffect } from "react";

interface Props {
  courses: RouterOutputs["subject"]["listCourses"];
  subjects: RouterOutputs["subject"]["listSubjects"];
  email: string;
  name?: string;
}

export const UpdateUserForm = ({ courses, subjects, email, name }: Props) => {

  const router = useRouter();

  const courseOptions = courses.map((course) => ({
    label: course.name,
    value: course.id,
  }));

  const subjectOptions = subjects.map((subject) => ({
    label: subject.name,
    value: subject.id,
  }));

  const updateUser = api.preloadedUsers.updateUser.useMutation();

  const form  = useForm({
    defaultValues: {
      name: "",
      email: email,
      courses: new Array<string>(),
      subjects: new Array<string>(),
    },
    resolver: zodResolver(updateUserSchema),
  })

  useEffect(() => {
    form.setValue("name", name ?? "");
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    await updateUser.mutateAsync(values);
    void router.push(Paths.Home);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
                  required 
                  placeholder="Enter your full name here"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="subjects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What subjects do you teach?</FormLabel>
              <FormControl>
                <MultiSelect
                  onValueChange={(value) => {
                    form.setValue("subjects", value);
                  }}
                  options={subjectOptions}
                  {...field}                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="courses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What courses do you teach?</FormLabel>
              <FormControl>
                <MultiSelect
                  onValueChange={(value) => {
                    form.setValue("courses", value);
                  }}
                  options={courseOptions}
                  {...field}                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        {
          updateUser.error &&
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {updateUser.error.message}
          </ul>
        }
        <div className="flex flex-row">
          <LoadingButton 
            type="submit"
            disabled={!form.formState.isDirty || updateUser.isLoading}
            loading={updateUser.isLoading}
            className="w-fit ml-auto my-auto">
              Submit
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
