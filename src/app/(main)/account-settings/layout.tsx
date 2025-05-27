import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  if (!user.isOnboarded) {
    redirect(Paths.Onboarding);
  }

  // Get the user's default classroom to provide a back link
  const backUrl = user.classroomId ? `/${user.classroomId}` : "/";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backUrl} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Classroom
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 