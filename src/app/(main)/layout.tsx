import AuthModal from "@/components/auth-modal";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest();
  return (
    <>
      <AuthModal user={user}/>
      {children}
    </>
  )
}