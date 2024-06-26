'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from 'date-fns'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { type RouterOutputs } from '@/trpc/shared';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { z } from "zod";
import { Paths } from "@/lib/constants";
import { CalendarIcon } from "@/components/icons";

interface Props {
  classrooms: RouterOutputs["classroom"]["list"];
  assignmentTemplateId: string;
}

const createAssignmentFormSchema = z.object({
  assignmentName: z.string(),
  classId: z.string().optional(),
  dueDate: z.date().min(new Date()),
  maxPoints: z.string().optional()
    .refine(value => !value || parseInt(value) > 0, "Max points must be greater than 0")
    .refine(value => !value || parseInt(value) <= 100, "Max points must be less than 100"),
  timeLimit: z.string().optional()
    .refine(value => !value || parseInt(value) > 0, "Time limit must be greater than 0 minutes")
    .refine(value => !value || parseInt(value) < 1000, "Time limit must be less than 1000 minutes")
});


export const CreateFullAssignmentForm = ({ classrooms, assignmentTemplateId }: Props) => {

  const router = useRouter();
  const createAssignment = api.assignment.create.useMutation();
  
  const form = useForm({
    defaultValues: {
      assignmentName: "",
      classId: undefined,
      dueDate: addDays(new Date(), 1),
      maxPoints: undefined,
      timeLimit: undefined,
    },
    resolver: zodResolver(createAssignmentFormSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const maxPoints:number|undefined = values.maxPoints && parseInt(values.maxPoints);
    const timeLimit:number|undefined = values.timeLimit && parseInt(values.timeLimit);

    const id = await createAssignment.mutateAsync(
      {
        assignmentName: values.assignmentName,
        classId: values.classId ? values.classId : undefined,
        maxPoints: maxPoints, 
        timeLimit: timeLimit,
        assignmentTemplateId: assignmentTemplateId,
        dueDate: values.dueDate,
      }
    );
    void router.replace(`${Paths.Assignment}${id}`)
  });

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="assignmentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Name</FormLabel>
              <FormControl>
                <Input {...field} required placeholder="Enter your assignment name here"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="classId"
          render={({ field }) => (
            <FormItem>
              <FormLabel asChild><legend>Subject</legend></FormLabel>
              <FormControl>
                <Select value={field.value} name={field.name} onValueChange={field.onChange} >
                  <SelectTrigger>
                    <SelectValue 
                      onBlur={field.onBlur}
                      ref={field.ref}
                      placeholder="Select a Classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {
                        classrooms.map(classroom => (
                          <SelectItem key={classroom.classroom.id} value={classroom.classroom.id}>
                            {classroom.classroom.name}
                          </SelectItem>
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
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < addDays(new Date(), 1)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxPoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Score</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Enter a number from 1-100"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Limit</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Enter time limit in minutes"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        {
          createAssignment.error &&
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {createAssignment.error.message}
          </ul>
        }
        <LoadingButton 
          disabled={!form.formState.isDirty || createAssignment.isLoading}
          loading={createAssignment.isLoading}
          className="w-fit ml-auto">
            Create Assignment
        </LoadingButton>
      </form>
    </Form>
  );
}