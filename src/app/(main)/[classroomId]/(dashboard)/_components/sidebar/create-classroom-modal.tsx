"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { api } from "@/trpc/react"
import posthog from "posthog-js"

export function CreateClassroomModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [selectedCourseId, setSelectedCourseId] = React.useState("")
  const [selectedGrade, setSelectedGrade] = React.useState("")
  const [courses, setCourses] = React.useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  // Fetch subjects and courses
  const { data: subjects } = api.subject.listSubjects.useQuery()
  const { data: coursesBySubject } = api.subject.getCoursesBySubject.useQuery(
    { subjectId: selectedSubjectId },
    { enabled: !!selectedSubjectId }
  )

  // Update courses when subject changes
  React.useEffect(() => {
    if (coursesBySubject) {
      setCourses(coursesBySubject)
    } else {
      setCourses([]) // Clear courses when no subject is selected
    }
  }, [coursesBySubject])

  const createClassroomMutation = api.classroom.create.useMutation({
    onSuccess: (classroomId) => {
      posthog.capture("classroom_created_success", {
        classroom_id: classroomId,
        classroom_name: name,
        has_description: !!description.trim(),
        description_length: description.trim().length,
        has_subject: !!selectedSubjectId,
        has_course: !!selectedCourseId,
        has_grade: !!selectedGrade,
      })
      setOpen(false)
      router.push(`/${classroomId}`)
    },
    onError: (error) => {
      posthog.capture("classroom_creation_failed", {
        classroom_name: name,
        has_description: !!description.trim(),
        error: error.message,
      })
      console.error("Failed to create classroom:", error)
      setIsLoading(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    posthog.capture("classroom_creation_submitted", {
      classroom_name: name,
      has_description: !!description.trim(),
      description_length: description.trim().length,
      has_subject: !!selectedSubjectId,
      has_course: !!selectedCourseId,
      has_grade: !!selectedGrade,
    })
    
    setIsLoading(true)
    createClassroomMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      subjectId: selectedSubjectId || undefined,
      courseId: selectedCourseId || undefined,
      gradeText: selectedGrade || undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // Closing the modal
      posthog.capture("create_classroom_modal_closed", {
        had_name: !!name.trim(),
        had_description: !!description.trim(),
        had_subject: !!selectedSubjectId,
        had_course: !!selectedCourseId,
        had_grade: !!selectedGrade,
        was_submitted: false,
      })
    }
    setOpen(newOpen)
    
    // Reset form when closing
    if (!newOpen) {
      setName("")
      setDescription("")
      setSelectedSubjectId("")
      setSelectedCourseId("")
      setSelectedGrade("")
      setIsLoading(false)
    }
  }

  const handleSubjectChange = (value: string) => {
    setSelectedSubjectId(value)
    setSelectedCourseId("") // Reset course when subject changes
    posthog.capture("create_classroom_subject_changed", {
      subject_id: value,
    })
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value)
    posthog.capture("create_classroom_course_changed", {
      course_id: value,
    })
  }

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value)
    posthog.capture("create_classroom_grade_changed", {
      grade: value,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 px-2 hover:bg-muted"
          onClick={() => {
            posthog.capture("create_classroom_modal_opened", {
              source: "sidebar",
            })
          }}
        >
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <PlusIcon className="size-4" />
          </div>
          <div className="font-medium">Create classroom</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new classroom</DialogTitle>
            <DialogDescription>
              Enter details for your new classroom
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="required">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter classroom name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter classroom description"
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">
                Subject (optional)
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="course">
                  Course (optional)
                </Label>
                {!selectedSubjectId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Please select a subject first to see available courses</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Select
                value={selectedCourseId}
                onValueChange={handleCourseChange}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedSubjectId ? "Select course" : "Select subject first"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">
                Grade (optional)
              </Label>
              <Select
                value={selectedGrade}
                onValueChange={handleGradeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "Create classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 