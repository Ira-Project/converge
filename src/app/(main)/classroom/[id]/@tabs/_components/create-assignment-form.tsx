'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { z } from "zod";
import Link from "next/link";
import type { RouterOutputs } from "@/trpc/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

interface Props {
  assignmentTemplates: RouterOutputs["assignmentTemplate"]["list"];
}

const assignmentTemplateSelectionSchema = z.object({
  assignmentTemplateId: z.string(),
});

export const CreateAssignmentForm = ({ assignmentTemplates } : Props) => {

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      assignmentTemplateId: "",
    },
    resolver: zodResolver(assignmentTemplateSelectionSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    router.replace(`/create-assignment/${values.assignmentTemplateId}`)
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-2">
        <FormField
          control={form.control}
          name="assignmentTemplateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel asChild><legend>Choose a Topic to Assign</legend></FormLabel>
              <FormControl>
                <Suspense fallback={ <Skeleton className="w-full h-8"/> } >
                  <Select value={field.value} name={field.name} onValueChange={field.onChange} >
                    <SelectTrigger>
                      <SelectValue 
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          assignmentTemplates.map(assignmentTemplate => (
                            <SelectItem 
                              key={assignmentTemplate.id} 
                              value={assignmentTemplate.id}>
                                {assignmentTemplate.name}
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Suspense>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <LoadingButton 
          disabled={!form.formState.isDirty}
          className="w-fit ml-auto">
            Preview
        </LoadingButton>
      </form>
    </Form>
  );
}