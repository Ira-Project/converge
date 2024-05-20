import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

import * as actions from "./schema/actions";

export const client = postgres(env.REALTIME_DATABASE_URL, {
  max_lifetime: 10, 
  prepare: false,
});

export const realtimeDb = drizzle(client, { schema: 
  {
    ...actions
  }
});
