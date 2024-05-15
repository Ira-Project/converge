import Link from "next/link";
import Image from "next/image";

import { UserDropdown } from "@/components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = async () => {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-10 p-0">
      <div className="flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link href="/">
          <Image priority src="/images/logo.png" alt="Logo" height={32} width={40} />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          {user ? <UserDropdown email={user.email} avatar={user.avatar} /> : null}
        </div>
      </div>
    </header>
  );
};
