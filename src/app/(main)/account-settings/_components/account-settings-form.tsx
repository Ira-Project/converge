"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar as ShadcnAvatar, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import Avatar from 'boring-avatars';
import { Star, StarOff, ExternalLink, Users, Archive, UserX } from "lucide-react";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import Link from "next/link";
import posthog from "posthog-js";

const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

type UpdateNameFormData = z.infer<typeof updateNameSchema>;

interface AccountSettingsFormProps {
  initialData: RouterOutputs["userSettings"]["getUserSettings"];
}

type ClassroomData = RouterOutputs["userSettings"]["getUserSettings"]["classrooms"][0];

export function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);

  const form = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: initialData.user.name ?? "",
    },
  });

  const updateNameMutation = api.userSettings.updateUserName.useMutation({
    onSuccess: () => {
      posthog.capture("account_settings_name_updated", {
        user_id: initialData.user.id,
        previous_name: initialData.user.name,
      });
      toast.success("Name updated successfully");
      setIsEditingName(false);
      router.refresh();
    },
    onError: (error) => {
      posthog.capture("account_settings_name_update_failed", {
        user_id: initialData.user.id,
        error: error.message,
      });
      toast.error(error.message || "Failed to update name");
    },
  });

  const setDefaultClassroomMutation = api.userSettings.setDefaultClassroom.useMutation({
    onSuccess: (data, variables) => {
      posthog.capture("account_settings_default_classroom_changed", {
        user_id: initialData.user.id,
        new_default_classroom_id: variables.classroomId,
        previous_default_classroom_id: initialData.user.defaultClassroomId,
      });
      toast.success("Default classroom updated successfully");
      router.refresh();
    },
    onError: (error, variables) => {
      posthog.capture("account_settings_default_classroom_change_failed", {
        user_id: initialData.user.id,
        attempted_classroom_id: variables.classroomId,
        error: error.message,
      });
      toast.error(error.message || "Failed to set default classroom");
    },
  });

  const onSubmit = (data: UpdateNameFormData) => {
    posthog.capture("account_settings_name_edit_attempted", {
      user_id: initialData.user.id,
      new_name: data.name,
    });
    updateNameMutation.mutate(data);
  };

  const handleSetDefaultClassroom = (classroomId: string) => {
    const classroom = initialData.classrooms.find(c => c.id === classroomId);
    posthog.capture("account_settings_default_classroom_change_attempted", {
      user_id: initialData.user.id,
      classroom_id: classroomId,
      classroom_name: classroom?.name,
    });
    setDefaultClassroomMutation.mutate({ classroomId });
  };

  const getClassroomBadgeVariant = (classroom: ClassroomData) => {
    if (classroom.isUserRemoved) return "destructive";
    if (classroom.isArchived) return "secondary";
    return "default";
  };

  const getClassroomStatusText = (classroom: ClassroomData) => {
    if (classroom.isUserRemoved) return "Removed";
    if (classroom.isArchived) return "Archived";
    return "Active";
  };

  const getClassroomIcon = (classroom: ClassroomData) => {
    if (classroom.isUserRemoved) return <UserX className="h-4 w-4" />;
    if (classroom.isArchived) return <Archive className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const formatAcademicYear = (year: number) => {
    const nextYear = year + 1;
    const nextYearLastTwo = nextYear.toString().slice(-2);
    return `${year}-${nextYearLastTwo}`;
  };

  return (
    <div className="space-y-6">
      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <ShadcnAvatar className="h-16 w-16">
              {initialData.user.avatar ? (
                <AvatarImage src={initialData.user.avatar} alt={initialData.user.name ?? "User"} />
              ) : (
                <Avatar name={initialData.user.name ?? "anonymous"} variant="bauhaus" size={64} />
              )}
            </ShadcnAvatar>
            <div>
              <p className="text-sm font-medium">Profile Picture</p>
              <p className="text-sm text-muted-foreground">
                Managed through your Google account
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            {isEditingName ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <LoadingButton 
                      type="submit" 
                      loading={updateNameMutation.isLoading}
                      disabled={updateNameMutation.isLoading}
                      size="sm"
                    >
                      Save
                    </LoadingButton>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        posthog.capture("account_settings_name_edit_cancelled", {
                          user_id: initialData.user.id,
                        });
                        setIsEditingName(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{initialData.user.name}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    posthog.capture("account_settings_name_edit_clicked", {
                      user_id: initialData.user.id,
                    });
                    setIsEditingName(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm text-muted-foreground">{initialData.user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Classrooms Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Classrooms</CardTitle>
          <CardDescription>
            Classrooms you're part of. Click on a classroom to navigate to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialData.classrooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              You're not part of any classrooms yet.
            </p>
          ) : (
            <div className="space-y-4">
              {initialData.classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${classroom.id}`}
                          className="text-lg font-semibold hover:underline flex items-center gap-2"
                          onClick={() => {
                            posthog.capture("account_settings_classroom_clicked", {
                              user_id: initialData.user.id,
                              classroom_id: classroom.id,
                              classroom_name: classroom.name,
                              classroom_status: classroom.isActive ? "active" : "archived",
                              is_default: classroom.isDefault,
                            });
                          }}
                        >
                          {classroom.name}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {classroom.isDefault && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {classroom.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {classroom.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getClassroomBadgeVariant(classroom)} className="flex items-center gap-1">
                          {getClassroomIcon(classroom)}
                          {getClassroomStatusText(classroom)}
                        </Badge>
                        <Badge variant="outline">
                          {classroom.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Year: {formatAcademicYear(classroom.year)}
                        </span>
                        {classroom.course && (
                          <span className="text-xs text-muted-foreground">
                            • {classroom.course.subject?.name} • {classroom.course.name}
                          </span>
                        )}
                        {classroom.gradeText && (
                          <span className="text-xs text-muted-foreground">
                            • Grade {classroom.gradeText}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Default classroom actions */}
                    {classroom.isActive && !classroom.isUserRemoved && !classroom.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultClassroom(classroom.id)}
                        disabled={setDefaultClassroomMutation.isLoading}
                        className="flex items-center gap-2"
                      >
                        <StarOff className="h-4 w-4" />
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 