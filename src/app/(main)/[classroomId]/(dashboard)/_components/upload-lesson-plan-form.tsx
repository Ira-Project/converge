'use client';

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { preSignedUrlSchema } from "@/server/api/routers/fileUpload/fileUpload.input";
import { useState } from "react";
import { toast } from "sonner";
import { SkillType } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";
import posthog from "posthog-js";

const skillOptions = Object.values(SkillType).map((skill) => ({
  label: skill,
  value: skill,
}));


export const UploadLessonPlanForm = () => {

  const getPresignedUrl = api.fileUpload.getPreSignedUrl.useMutation();
  const uploadLessonPlan = api.fileUpload.uploadLessonPlan.useMutation();

  const form = useForm({
    defaultValues: {
      fileName: "",
      file: null,
      topicName: "",
      skills: new Array<string>(),
    },
    resolver: zodResolver(preSignedUrlSchema),
  })

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const onSubmit = form.handleSubmit(async (values) => {
    posthog.capture("lesson_plan_upload_started", {
      topic_name: values.topicName,
      has_file: !!values.file,
      file_name: fileName,
      skills_count: values.skills.length,
      skills: values.skills,
    });
    
    setLoading(true);
    
    try {
      if (values.file) {
        const presignedUrl = await getPresignedUrl.mutateAsync({
          topicName: values.topicName,
          fileName: fileName,
          file: values.file,
          skills: values.skills,
        });

        const result = await fetch(presignedUrl, {
          method: 'PUT',
          body: values.file
        })

        if (result.status !== 200 || !result.url) {
          posthog.capture("lesson_plan_file_upload_failed", {
            topic_name: values.topicName,
            file_name: fileName,
            status: result.status,
          });
          toast("An error occured while uploading your lesson plan. Please try again later");      
          setLoading(false);
          return;
        }

        posthog.capture("lesson_plan_file_uploaded_successfully", {
          topic_name: values.topicName,
          file_name: fileName,
        });

        await uploadLessonPlan.mutateAsync({
          url: result.url, 
          fileName: fileName,
          topicName: values.topicName,
          skills: values.skills,
        });

      } else {
        await uploadLessonPlan.mutateAsync({
          topicName: values.topicName,
          fileName: fileName,
          skills: values.skills,
        });
      }
      
      
      setLoading(false);
      toast("Your requested has been sent. Check back in 48 hours for activities.");
      
      // Reset form after successful submission
      form.reset();
      setFileName("");
      
    } catch (error) {
      posthog.capture("lesson_plan_upload_failed", {
        topic_name: values.topicName,
        has_file: !!values.file,
        file_name: fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setLoading(false);
    }
  });

  return (
    <Form {...form} >
      <form onSubmit={onSubmit} className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col gap-3 md:gap-4">
          <FormField
            control={form.control}
            name="topicName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-sm md:text-base">Topic Name</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Enter topic name" className="text-sm md:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base">What skills do you want to target?</FormLabel>
                <FormControl>
                  <MultiSelect
                    onValueChange={(value) => {
                      form.setValue("skills", value);
                    }}
                    options={skillOptions}
                    {...field}                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-sm md:text-base">Lesson Plan or Curriculum (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    id="file" 
                    value={undefined}
                    onChange={(e) => {
                      e.target.files 
                        && e.target.files[0] !== null 
                        && field.onChange(e.target.files[0])
                      e.target.files 
                        && e.target.files[0] !== null 
                        && e.target.files[0]?.name
                        && setFileName(e.target.files[0]?.name)
                      }}
                    type="file" 
                    className="text-sm md:text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>

        {
          (getPresignedUrl.error ?? uploadLessonPlan.error) &&
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {getPresignedUrl.error ? 
              getPresignedUrl.error.message : 
              uploadLessonPlan.error ? uploadLessonPlan.error.message : "An Error occured"}
          </ul>
        }

        <LoadingButton 
          disabled={!form.formState.isDirty || getPresignedUrl.isLoading || uploadLessonPlan.isLoading || loading}
          loading={getPresignedUrl.isLoading || uploadLessonPlan.isLoading || loading}
          className="w-full md:w-fit md:ml-auto text-sm md:text-base">
            Submit
        </LoadingButton>
      </form>
    </Form>
  );
}