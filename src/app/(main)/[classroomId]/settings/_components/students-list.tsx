"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/utils";

interface StudentsListProps {
  students: Array<{
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  }>;
  classroomId: string;
}

export default function StudentsList({ students, classroomId }: StudentsListProps) {
  const router = useRouter();
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const removeStudent = api.classroom.removeStudent.useMutation({
    onSuccess: () => {
      toast.success("Student removed from classroom");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove student");
    },
  });

  const handleRemoveStudent = (studentId: string) => {
    setStudentToRemove(studentId);
    setIsDialogOpen(true);
  };

  const confirmRemoveStudent = () => {
    if (studentToRemove) {
      removeStudent.mutate({
        classroomId,
        studentId: studentToRemove,
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No students in this classroom
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar ?? undefined} alt={student.name ?? "Student"} />
                        <AvatarFallback>{getUserInitials(student.name ?? "Student")}</AvatarFallback>
                      </Avatar>
                      <span>{student.name ?? "Unnamed Student"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.id)}
                      disabled={removeStudent.isLoading}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student from the classroom? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveStudent} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 