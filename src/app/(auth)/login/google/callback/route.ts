import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { google, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths, Roles } from "@/lib/constants";
import { users } from "@/server/db/schema/user";
import { getClassroomIdFromPathname } from "@/lib/server-utils";
import { usersToClassrooms } from "@/server/db/schema/classroom";

type GoogleUser = {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookieStore.get("state")?.value ?? null;
  const storedCodeVerifier = cookieStore.get("code_verifier")?.value ?? null;
  // When there is a return path, we are assuming that the user is a student
  const returnPath = cookieStore.get("returnPath")?.value;

  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    return new Response(null, {
      status: 400,
      headers: { Location: returnPath ?? Paths.Login },
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    const user = (await response.json()) as GoogleUser; 

    if (!user.email || !user.name) {
      return new Response(
        JSON.stringify({
          error: "Your Google account must have a verified email address.",
        }),
        { status: 400, headers: { Location: returnPath ?? Paths.Login } },
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq }) =>
        eq(table.email, user.email!)
    });

    if (!existingUser) {
      const userId = generateId(21);
      const classroomId = await getClassroomIdFromPathname(returnPath ?? '');

      await db.insert(users).values({
        id: userId,
        name: user.name,
        email: user.email,
        emailVerified: true,
        avatar: user.picture,
        role: returnPath ? Roles.Student : Roles.Teacher,
        isOnboarded: returnPath ? true : false,
        defaultClassroomId: classroomId,
      });

      if (classroomId) {
        await db.insert(usersToClassrooms).values({
          userId: userId,
          classroomId: classroomId,
          role: Roles.Student,
        });
      }

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );


      return new Response(null, {
        status: 302,
        headers: { Location: returnPath ?? Paths.Onboarding },
      });
    }

    if (existingUser.avatar !== user.picture || !existingUser.emailVerified) {
      await db
        .update(users)
        .set({
          emailVerified: true,
          avatar: user.picture,
        })
        .where(eq(users.id, existingUser.id));
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    if(!existingUser?.isOnboarded) {
      return new Response(null, {
        status: 302,
        headers: { Location: returnPath ?? `${Paths.Onboarding}` },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: returnPath ?? `${Paths.Classroom}${existingUser.defaultClassroomId}` },
    });
    
  } catch (e) {

    if (e instanceof OAuth2RequestError) {
      return new Response(JSON.stringify({ message: e.message }), {
        status: 400,
        headers: { Location: returnPath ?? Paths.Login },
      });
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { Location: returnPath ?? Paths.Login },
    });
  }
}

