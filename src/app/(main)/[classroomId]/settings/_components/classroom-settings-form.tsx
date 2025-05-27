"use client"

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import posthog from "posthog-js";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  showLeaderboardStudents: z.boolean().default(false),
  showLeaderboardTeachers: z.boolean().default(false),
});

interface ClassroomSettingsFormProps {
  classroom: {
    name: string;
    description: string;
    year: number;
    showLeaderboardStudents: boolean;
    showLeaderboardTeachers: boolean;
  };
  classroomId: string;
}

export default function ClassroomSettingsForm({
  classroom,
  classroomId,
}: ClassroomSettingsFormProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classroom?.name ?? "",
      description: classroom?.description ?? "",
      year: classroom?.year ?? new Date().getFullYear(),
      showLeaderboardStudents: classroom?.showLeaderboardStudents ?? false,
      showLeaderboardTeachers: classroom?.showLeaderboardTeachers ?? false,
    },
  });

  const updateClassroom = api.classroom.update.useMutation({
    onSuccess: () => {
      const formValues = form.getValues();
      posthog.capture("classroom_settings_updated", {
        classroom_id: classroomId,
        classroom_name: formValues.name,
        has_description: !!formValues.description?.trim(),
        year: formValues.year,
        show_leaderboard_students: formValues.showLeaderboardStudents,
        show_leaderboard_teachers: formValues.showLeaderboardTeachers,
        changes_made: {
          name_changed: formValues.name !== classroom.name,
          description_changed: formValues.description !== classroom.description,
          year_changed: formValues.year !== classroom.year,
          leaderboard_students_changed: formValues.showLeaderboardStudents !== classroom.showLeaderboardStudents,
          leaderboard_teachers_changed: formValues.showLeaderboardTeachers !== classroom.showLeaderboardTeachers,
        },
      });
      toast.success("Classroom settings updated successfully. Refresh the page to see the changes.");
    },
    onError: (error) => {
      posthog.capture("classroom_settings_update_failed", {
        classroom_id: classroomId,
        error: error.message,
      });
      toast.error(error.message || "Failed to update classroom settings");
    },
  });

  const archiveClassroom = api.classroom.archive.useMutation({
    onSuccess: () => {
      posthog.capture("classroom_archived", {
        classroom_id: classroomId,
        classroom_name: classroom.name,
      });
      toast.success("Classroom archived successfully. It will no longer appear in your classroom list.");
      // Redirect to the classrooms page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      posthog.capture("classroom_archive_failed", {
        classroom_id: classroomId,
        error: error.message,
      });
      toast.error(error.message || "Failed to archive classroom");
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    posthog.capture("classroom_settings_update_attempted", {
      classroom_id: classroomId,
      classroom_name: values.name,
      has_description: !!values.description?.trim(),
      year: values.year,
      show_leaderboard_students: values.showLeaderboardStudents,
      show_leaderboard_teachers: values.showLeaderboardTeachers,
    });
    
    updateClassroom.mutate({
      id: classroomId,
      ...values,
    });
  };

  const handleArchive = () => {
    posthog.capture("classroom_archive_confirmation_shown", {
      classroom_id: classroomId,
      classroom_name: classroom.name,
    });
    
    if (confirm("Are you sure you want to archive this classroom?")) {
      posthog.capture("classroom_archive_confirmed", {
        classroom_id: classroomId,
        classroom_name: classroom.name,
      });
      
      archiveClassroom.mutate({
        id: classroomId,
      });
    } else {
      posthog.capture("classroom_archive_cancelled", {
        classroom_id: classroomId,
        classroom_name: classroom.name,
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Classroom Name</Label>
          <Input
            id="name"
            placeholder="Enter classroom name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter classroom description"
            rows={3}
            {...form.register("description")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Academic Year</Label>
          <Input
            id="year"
            type="number"
            min={2000}
            max={2100}
            placeholder="Enter academic year"
            {...form.register("year", { valueAsNumber: true })}
          />
          {form.formState.errors.year && (
            <p className="text-sm text-destructive">
              {form.formState.errors.year.message}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-medium">Leaderboard Settings</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showLeaderboardStudents"
              checked={form.watch("showLeaderboardStudents")}
              onCheckedChange={(checked) => {
                posthog.capture("classroom_settings_leaderboard_students_toggled", {
                  classroom_id: classroomId,
                  new_value: checked === true,
                });
                form.setValue("showLeaderboardStudents", checked === true, { shouldDirty: true });
              }}
            />
            <Label
              htmlFor="showLeaderboardStudents"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Show leaderboard to students
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showLeaderboardTeachers"
              checked={form.watch("showLeaderboardTeachers")}
              onCheckedChange={(checked) => {
                posthog.capture("classroom_settings_leaderboard_teachers_toggled", {
                  classroom_id: classroomId,
                  new_value: checked === true,
                });
                form.setValue("showLeaderboardTeachers", checked === true, { shouldDirty: true });
              }}
            />
            <Label
              htmlFor="showLeaderboardTeachers"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Show leaderboard to teachers
            </Label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button 
            type="submit"
            disabled={updateClassroom.isLoading || !form.formState.isDirty}
            className="mt-4"
          >
            {updateClassroom.isLoading ? "Saving..." : "Save Changes"}
          </Button>
          
          <Button 
            type="button"
            variant="destructive"
            onClick={handleArchive}
            disabled={archiveClassroom.isLoading}
            className="mt-4"
          >
            {archiveClassroom.isLoading ? "Archiving..." : "Archive Classroom"}
          </Button>
        </div>
      </form>
    </div>
  );
} 