'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Paths } from "@/lib/constants";
import posthog from "posthog-js";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export default function AssignmentShareModal({ 
  classroomId
} : { classroomId: string }) {  


  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    posthog.capture("classsroom_share_copied");
    await navigator.clipboard.writeText(`${window.location.origin}${Paths.Classroom}${classroomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => {
        posthog.capture("classroom_share_clicked");
      }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="text-sidebar-foreground/70 text-sm p-2 cursor-pointer">
              + Add Students
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      </DialogTrigger>
      <DialogContent className="p-8 pb-16">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To invite your students to this classroom, copy the link below and share it with them. When your students login they will be added to the classroom.
          </p>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={`${window.location.origin}${Paths.Classroom}${classroomId}`}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? 
                <Check className="h-4 w-4" /> : 
                <Copy className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      </DialogContent>  
    </Dialog>
  );
}