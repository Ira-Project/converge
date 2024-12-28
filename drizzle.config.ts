import { defineConfig } from "drizzle-kit";

// MAIN DB

export default defineConfig({
  schema: "./src/server/db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.ENVIRONMENT === 'dev' ? process.env.DATABASE_URL_DEV! : process.env.DATABASE_URL_PROD!,
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