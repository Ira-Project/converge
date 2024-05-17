import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

import * as assignment from "./schema/assignment";
import * as classroom from "./schema/classroom";
import * as subject from "./schema/subject";
import * as user from "./schema/user";
import * as assignmentTemplates from "./schema/assignmentTemplate";


export const client = postgres(env.DATABASE_URL, {
  max_lifetime: 10, 
  prepare: false,
});

export const db = drizzle(client, { schema: 
  {
    ...assignment, 
    ...classroom, 
    ...subject, 
    ...user,
    ...assignmentTemplates
  }
});
