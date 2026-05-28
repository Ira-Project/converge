-- Run this once in the Supabase SQL editor after Drizzle has created the tables.
-- Drizzle creates ira_project_actions; Supabase needs it added to the realtime publication.

insert into storage.buckets (id, name, public, file_size_limit)
values ('lesson-plans', 'lesson-plans', true, 26214400)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ira_project_actions'
  ) then
    alter publication supabase_realtime add table public.ira_project_actions;
  end if;
end $$;

alter table public.ira_project_actions enable row level security;

drop policy if exists "allow realtime reads for activity updates" on public.ira_project_actions;
create policy "allow realtime reads for activity updates"
on public.ira_project_actions
for select
to anon, authenticated
using (true);

drop policy if exists "allow lesson plan uploads from signed urls" on storage.objects;
create policy "allow lesson plan uploads from signed urls"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'lesson-plans');

drop policy if exists "allow lesson plan public reads" on storage.objects;
create policy "allow lesson plan public reads"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'lesson-plans');
