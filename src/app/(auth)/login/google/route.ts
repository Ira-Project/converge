import { cookies } from "next/headers";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/auth";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await google.createAuthorizationURL(state, codeVerifier,
    { scopes: ["profile", "email"] }
  );

  // store state verifier as cookie
  (await
    // store state verifier as cookie
    cookies()).set("state", state, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });

  // store code verifier as cookie
  (await
    // store code verifier as cookie
    cookies()).set("code_verifier", codeVerifier, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });

  return Response.redirect(url);
}
