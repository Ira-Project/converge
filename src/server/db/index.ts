import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

import * as assignment from "./schema/assignment";
import * as classroom from "./schema/classroom";
import * as subject from "./schema/subject";
import * as user from "./schema/user";
import * as concept from "./schema/concept";
import * as assignmentDetails from "./schema/questions";
import * as explanations from "./schema/explanations";
import * as testAttempts from "./schema/testAttempt";
import { lessonPlanFiles } from "./schema/lessonPlan";

export const client = postgres(env.DATABASE_URL, {
  max_lifetime: 10, 
  prepare: false,
  onnotice: () => {return},
});

export const db = drizzle(client, { schema: 
  {
    ...assignment, 
    ...classroom, 
    ...subject, 
    ...user,
    ...concept,
    ...assignmentDetails,
    ...explanations,
    ...testAttempts,
    ...lessonPlanFiles,
  }
});
