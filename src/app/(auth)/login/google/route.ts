import { cookies } from "next/headers";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/auth";

export async function GET(request: Request): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // Get return path from query params if it exists
  const { searchParams } = new URL(request.url);
  const returnPath = searchParams.get('returnPath');

  console.log("returnPath in google route", returnPath);

  const url = await google.createAuthorizationURL(state, codeVerifier,
    { scopes: ["profile", "email"] }
  );
  
  // store state verifier as cookie
  (await
    // store state verifier as cookie
    cookies()).set("state", state, {
    secure: process.env.NODE_ENV === "production", // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });

  // store code verifier as cookie
  (await
    // store code verifier as cookie
    cookies()).set("code_verifier", codeVerifier, {
    secure: process.env.NODE_ENV === "production", // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });

  // store return path as cookie if it exists
  if (returnPath) {
    (await cookies()).set("returnPath", returnPath, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10 // 10 min
    });
  }

  return Response.redirect(url);
}
