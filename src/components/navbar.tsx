import Link from "next/link";
import Image from "next/image";

import { UserDropdown } from "@/components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import { ThemeToggle } from "@/components/theme-toggle";
import { Paths } from "@/lib/constants";

export const Navbar = async () => {
  const { user } = await validateRequest();
  return (
    <header className="sticky top-0 z-10 p-0 border-b-2">
      <div className="flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link href={Paths.Home}>
          <Image priority src="/images/logo.png" alt="Logo" height={32} width={32} />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          {user ? <UserDropdown email={user.email} avatar={user.avatar} name={user.name ?? undefined}/> : null}
        </div>
      </div>
    </header>
  );
};
