"use client";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


const BackButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {

    const router = useRouter();
    const handleClick = () => {
      router.back();
    };

    return (
      <Button
        onClick={handleClick}
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

BackButton.displayName = "BackButton";

export { BackButton };
