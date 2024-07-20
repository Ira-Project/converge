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


export const UploadLessonPlanForm = () => {

  const getPresignedUrl = api.fileUpload.getPreSignedUrl.useMutation();
  const uploadLessonPlan = api.fileUpload.uploadLessonPlan.useMutation();

  const form = useForm({
    defaultValues: {
      fileName: "",
      file: null,
    },
    resolver: zodResolver(preSignedUrlSchema),
  })

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    console.log(values.file);

    const presignedUrl = await getPresignedUrl.mutateAsync({
      fileName: fileName,
      file: values.file
    });

    const result = await fetch(presignedUrl, {
      method: 'PUT',
      body: values.file
    })

    if (result.status !== 200 || !result.url) {
      toast("An error occured while uploading your lesson plan. Please try again later");      
    } else {
      void uploadLessonPlan.mutateAsync({url: result.url, fileName: fileName});
      toast("Your lesson plan has been uploaded successfully. Check back in 24 hours for an assignment template");
    }

    setLoading(false);
    
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-2">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
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
                  type="file" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
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
          className="w-fit ml-auto">
            Upload Lesson Plan
        </LoadingButton>
      </form>
    </Form>
  );
}