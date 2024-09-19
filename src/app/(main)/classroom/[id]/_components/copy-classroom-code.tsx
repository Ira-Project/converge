'use client'
import { ClipboardCopyIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { toast } from "sonner";

export const CopyClassroomCode = ({ code }: { code: string }) => {

  return (
    <div className="flex flex-row gap-4">
      <Suspense fallback={<Skeleton className="w-full h-8"/>}>
        <Input className="bg-white" value={code} readOnly />
        <Button variant="outline" size="icon" className="bg-white">
          <ClipboardCopyIcon
            onClick={() => {
              void navigator.clipboard.writeText(code);
              toast.success("Copied to clipboard", {
                duration: 2000,
              });
            }}
          />
        </Button>
      </Suspense>
    </div>
  );
}