import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/server/db/schema/**/*.ts",
    "./src/server/realtime_db/schema/**/*.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.ENVIRONMENT === "dev"
        ? process.env.DATABASE_URL_DEV!
        : process.env.DATABASE_URL_PROD!,
  }
});
