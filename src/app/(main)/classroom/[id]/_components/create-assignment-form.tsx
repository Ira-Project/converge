'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { z } from "zod";
import Link from "next/link";

// interface Props {
//   subjects: RouterOutputs["subject"]["list"];
// }

const assignmentTemplateSelectionSchema = z.object({
  assignmentTemplateId: z.string(),
});

export const CreateAssignmentForm = () => {

  const router = useRouter();

  const assignmentTemplates = [
    {
      id: "1",
      name: "Probability",
    },
    {
      id: "2",
      name: "Arithmetic Progression",
    },
  ]

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
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">Create Assignment</p>
      <p className="text-sm"> You will be able to customise the due date, maximum score and time limit in the next screen.</p>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField
            control={form.control}
            name="assignmentTemplateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose a Topic to Assign</FormLabel>
                <FormControl>
                  <Select value={field.value} name={field.name} onValueChange={field.onChange} >
                    <SelectTrigger>
                      <SelectValue 
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Select a subject" />
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
                </FormControl>
                <FormDescription>
                  Don't see what you're looking for? {" "}
                  <Link href="mailto:contact@iraproject.com">
                    <span className="underline">Contact Us</span>
                  </Link> 
                  {" "}
                  we'd be happy to create it for you.
                  
                </FormDescription>
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
    </div>
  );
}