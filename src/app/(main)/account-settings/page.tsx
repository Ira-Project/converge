import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AccountSettingsForm } from "./_components/account-settings-form";

export const metadata = {
  title: "Account Settings",
  description: "Manage your account settings",
};

export default async function AccountSettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  if (!user.isOnboarded) {
    redirect(Paths.Onboarding);
  }

  const userSettings = await api.userSettings.getUserSettings.query({});

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and classroom preferences
          </p>
        </div>
                
        <AccountSettingsForm initialData={userSettings} />
      </div>
    </div>
  );
} 