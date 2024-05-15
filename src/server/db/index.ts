import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

console.log(env.DATABASE_URL);

export const client = postgres(env.DATABASE_URL, {
  max_lifetime: 10, 
  prepare: false,
});

export const db = drizzle(client, { schema });
