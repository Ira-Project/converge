'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClassroomSchema } from "@/server/api/routers/classroom/classroom.input";
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { type RouterOutputs } from '@/trpc/shared';
import { revalidateClassroomListQuery } from "../../_actions/revalidateCache";

interface Props {
  courses: RouterOutputs["subject"]["listCourses"];
}

export const CreateClassroomForm = ({ courses }: Props) => {

  const router = useRouter();

  const createClassroom = api.classroom.create.useMutation();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      course: "",
    },
    resolver: zodResolver(createClassroomSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const id = await createClassroom.mutateAsync({...values});
    await revalidateClassroomListQuery();
    void router.replace(`/classroom/${id}`)
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
                <Input {...field} required placeholder="Enter your class name here"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Type your description here" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <FormControl>
                <Select value={field.value} name={field.name} onValueChange={field.onChange} >
                  <SelectTrigger>
                    <SelectValue 
                      onBlur={field.onBlur}
                      ref={field.ref}
                      placeholder="Select a Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {
                        courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toLocaleString()}>{course.name}</SelectItem>
                        ))
                      }
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        {
          createClassroom.error &&
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {createClassroom.error.message}
          </ul>
        }
        <LoadingButton 
          disabled={!form.formState.isDirty || createClassroom.isLoading}
          loading={createClassroom.isLoading}
          className="w-fit ml-auto">
            Create Classroom
        </LoadingButton>
      </form>
    </Form>
  );
}