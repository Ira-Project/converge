# Supabase Migration

This fork uses Supabase for:

- Postgres data storage through the existing Drizzle models.
- Postgres Changes realtime subscriptions for `ira_project_actions`.
- Storage uploads for lesson-plan files.

Auth remains Lucia-backed. That keeps the existing user/session model intact while moving the backing infrastructure to Supabase.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill in the Supabase values.
3. Use the pooled Supabase Postgres URL for `DATABASE_URL_DEV` and `DATABASE_URL_PROD`.
4. Generate and push the Drizzle schema:

```bash
pnpm install
pnpm db:generate
pnpm db:push
```

5. Run `supabase/bootstrap.sql` in the Supabase SQL editor. This creates the `lesson-plans` bucket, enables realtime for `ira_project_actions`, and adds the minimum policies needed by the current browser clients.
6. Seed app data if needed:

```bash
pnpm seed
```

## Notes

- `REALTIME_DATABASE_URL` is removed. Realtime writes and subscriptions use the same Supabase Postgres database as the app.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are removed. Lesson-plan upload targets are now created with `SUPABASE_SERVICE_ROLE_KEY`.
- `NEXT_PUBLIC_SUPABASE_KEY` is still accepted as a fallback, but new environments should use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The realtime RLS policy in `supabase/bootstrap.sql` allows anonymous select access to `ira_project_actions` so the existing public Supabase client can receive Postgres changes. Tighten this before production if payloads include sensitive student data.
