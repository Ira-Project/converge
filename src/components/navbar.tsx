import Link from "next/link";
import Image from "next/image";

import { UserDropdown } from "@/components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

export const Navbar = async () => {
  const { user } = await validateRequest();
  return (
    <header className="sticky top-0 z-25 p-0 border-b-2 bg-white">
      <div className="flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link href={Paths.Home} className="flex flex-row gap-4">
          <Image priority src="/images/logo.png" alt="Logo" height={32} width={32} />
          <span className="my-auto text-2xl">
            Ira Project
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {user ? <UserDropdown email={user.email} avatar={user.avatar} name={user.name ?? undefined}/> : null}
        </div>
      </div>
    </header>
  );
};
