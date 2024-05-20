import { defineConfig } from "drizzle-kit";

// MAIN DB

export default defineConfig({
  schema: "./src/server/db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});

//REAL TIME
// export default defineConfig({
//   schema: "./src/server/realtime_db/schema/*",
//   // out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.REALTIME_DATABASE_URL!,
//   }
// });