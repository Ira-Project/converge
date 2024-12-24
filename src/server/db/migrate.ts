import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { env } from "@/env";
import * as assignment from "./schema/learnByTeaching/explainAssignment";
import * as classroom from "./schema/classroom";
import * as subject from "./schema/subject";
import * as user from "./schema/user";
import * as concept from "./schema/learnByTeaching/concept";
import * as assignmentDetails from "./schema/learnByTeaching/questions";
import * as explanations from "./schema/learnByTeaching/explanations";
import * as testAttempts from "./schema/learnByTeaching/explainTestAttempt";
import { lessonPlanFiles } from "./schema/lessonPlan";


export async function runMigrate() {
  const connection = postgres(env.DATABASE_URL);
  const schema = { 
    ...assignment, 
    ...classroom, 
    ...subject, 
    ...user,
    ...concept,
    ...assignmentDetails,
    ...explanations,
    ...testAttempts,
    ...lessonPlanFiles,
  };
  const db = drizzle(connection, { schema });

  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "drizzle" });

  await connection.end();

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);

  process.exit(0);
}

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
