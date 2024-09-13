import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { google, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths, Roles } from "@/lib/constants";
import { users } from "@/server/db/schema/user";

type GoogleUser = {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("state")?.value ?? null;
  const storedCodeVerifier = cookies().get("code_verifier")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    return new Response(null, {
      status: 400,
      headers: { Location: Paths.Login },
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
        { status: 400, headers: { Location: Paths.Login } },
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq }) =>
        eq(table.email, user.email!)
    });

    const preloadedUsers = await db.query.preloadedUsers.findFirst({
      where: (table, { eq }) => eq(table.email, user.email!),
    });

    if (!existingUser) {
      const userId = generateId(21);
      await db.insert(users).values({
        id: userId,
        name: user.name,
        email: user.email,
        emailVerified: true,
        avatar: user.picture,
        role: preloadedUsers ? preloadedUsers.role : Roles.Student,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      if(preloadedUsers?.notOnboarded) {
        return new Response(null, {
          status: 302,
          headers: { Location: Paths.Onboarding },
        });
      }
      
      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Home },
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
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    if(preloadedUsers?.notOnboarded) {
      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Onboarding },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: Paths.Home },
    });
    
  } catch (e) {

    console.log("ERROR: ", e);

    if (e instanceof OAuth2RequestError) {
      return new Response(JSON.stringify({ message: e.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

