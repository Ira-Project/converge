"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { GradesOptions, Paths } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";
import { updateUserSchema } from "@/server/api/routers/userOnboarding/userOnboarding.input";
import { Badge } from "@/components/ui/badge";

interface Props {
  courses: RouterOutputs["subject"]["listCourses"];
  subjects: RouterOutputs["subject"]["listSubjects"];
  email: string;
  name?: string;
}

const BadgeIcon = () => (
  <Badge 
    className="py-0 px-2 mx-4 bg-slate-400"
    variant="outline">
    <span className="text-xs text-white">Coming Soon</span>
  </Badge>
);

export const UpdateUserForm = ({ courses, subjects, email, name }: Props) => {

  const router = useRouter();

  const courseOptions = courses.map((course) => ({
    label: course.name,
    value: course.id,
    icon: course.locked ? BadgeIcon : undefined,
  }));

  const subjectOptions = subjects.map((subject) => ({
    label: subject.name,
    value: subject.id,
    icon: subject.locked ? BadgeIcon : undefined,
  }));

  const gradeOptions = GradesOptions.map((grade) => ({
    label: grade.label,
    value: grade.value,
    icon: grade.locked ? BadgeIcon : undefined,
  }));

  const updateUser = api.userOnboardingRouter.updateUser.useMutation();

  const form  = useForm({
    defaultValues: {
      name: name ?? "",
      email: email,
      courses: new Array<string>(),
      subjects: new Array<string>(),
      grades: new Array<string>(),
    },
    resolver: zodResolver(updateUserSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    console.log("values", values);
    const classroomId = await updateUser.mutateAsync(values);
    void router.push(`${Paths.Classroom}${classroomId}`);
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
        <FormField
          control={form.control}
          name="grades"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What grades do you teach?</FormLabel>
              <FormControl>
                <MultiSelect
                  onValueChange={(value) => {
                    form.setValue("grades", value);
                  }}
                  options={gradeOptions}
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
            disabled={updateUser.isLoading}
            loading={updateUser.isLoading}
            className="w-fit ml-auto my-auto">
              Submit
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
