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
import { api } from "@/trpc/react"
import posthog from "posthog-js"

export function CreateClassroomModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const createClassroomMutation = api.classroom.create.useMutation({
    onSuccess: (classroomId) => {
      posthog.capture("classroom_created_success", {
        classroom_id: classroomId,
        classroom_name: name,
        has_description: !!description.trim(),
        description_length: description.trim().length,
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
    })
    
    setIsLoading(true)
    createClassroomMutation.mutate({
      name: name.trim(),
      description: description.trim()
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // Closing the modal
      posthog.capture("create_classroom_modal_closed", {
        had_name: !!name.trim(),
        had_description: !!description.trim(),
        was_submitted: false,
      })
    }
    setOpen(newOpen)
    
    // Reset form when closing
    if (!newOpen) {
      setName("")
      setDescription("")
      setIsLoading(false)
    }
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new classroom</DialogTitle>
            <DialogDescription>
              Enter details for your new classroom. Click create when you're done.
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