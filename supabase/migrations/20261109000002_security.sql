-- ═══════════════════════════════════════════════════════════════════════════
-- NarReklam — Row Level Security & storage
-- Principle: anonymous visitors can READ published public content only.
-- They can never read or write quote data directly (the Edge Function does
-- inserts with the service role after validation). Staff = editor | admin.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_category_translations enable row level security;
alter table public.services enable row level security;
alter table public.service_translations enable row level security;
alter table public.service_items enable row level security;
alter table public.service_item_translations enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_translations enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.project_services enable row level security;
alter table public.faq_items enable row level security;
alter table public.faq_translations enable row level security;
alter table public.content_blocks enable row level security;
alter table public.content_translations enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_attachments enable row level security;
alter table public.quote_internal_notes enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────
create policy "profiles: read own or admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles: admin updates" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());
-- (No insert/delete policies: rows are created by the auth trigger.)

-- ── Site settings ─────────────────────────────────────────────────────────
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admin write" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ── Catalog ───────────────────────────────────────────────────────────────
create policy "categories: public read published" on public.service_categories for select
  using (is_published or public.is_staff());
create policy "categories: staff write" on public.service_categories for all
  using (public.is_staff()) with check (public.is_staff());

create policy "category tr: public read" on public.service_category_translations for select
  using (exists (select 1 from public.service_categories c where c.id = category_id and (c.is_published or public.is_staff())));
create policy "category tr: staff write" on public.service_category_translations for all
  using (public.is_staff()) with check (public.is_staff());

create policy "services: public read published" on public.services for select
  using (
    (is_published and exists (select 1 from public.service_categories c where c.id = category_id and c.is_published))
    or public.is_staff()
  );
create policy "services: staff write" on public.services for all
  using (public.is_staff()) with check (public.is_staff());

create policy "service tr: public read" on public.service_translations for select
  using (exists (select 1 from public.services s where s.id = service_id and (s.is_published or public.is_staff())));
create policy "service tr: staff write" on public.service_translations for all
  using (public.is_staff()) with check (public.is_staff());

create policy "items: public read published" on public.service_items for select
  using ((is_published and exists (select 1 from public.services s where s.id = service_id and s.is_published)) or public.is_staff());
create policy "items: staff write" on public.service_items for all
  using (public.is_staff()) with check (public.is_staff());

create policy "item tr: public read" on public.service_item_translations for select
  using (exists (select 1 from public.service_items i where i.id = item_id and (i.is_published or public.is_staff())));
create policy "item tr: staff write" on public.service_item_translations for all
  using (public.is_staff()) with check (public.is_staff());

-- ── Portfolio (demo projects are never public) ────────────────────────────
create policy "projects: public read published" on public.portfolio_projects for select
  using ((is_published and not is_demo) or public.is_staff());
create policy "projects: staff write" on public.portfolio_projects for all
  using (public.is_staff()) with check (public.is_staff());

create policy "project tr: public read" on public.portfolio_translations for select
  using (exists (select 1 from public.portfolio_projects p where p.id = project_id and ((p.is_published and not p.is_demo) or public.is_staff())));
create policy "project tr: staff write" on public.portfolio_translations for all
  using (public.is_staff()) with check (public.is_staff());

create policy "project images: public read" on public.portfolio_images for select
  using (exists (select 1 from public.portfolio_projects p where p.id = project_id and ((p.is_published and not p.is_demo) or public.is_staff())));
create policy "project images: staff write" on public.portfolio_images for all
  using (public.is_staff()) with check (public.is_staff());

create policy "project services: public read" on public.project_services for select
  using (exists (select 1 from public.portfolio_projects p where p.id = project_id and ((p.is_published and not p.is_demo) or public.is_staff())));
create policy "project services: staff write" on public.project_services for all
  using (public.is_staff()) with check (public.is_staff());

-- ── FAQ, content, Instagram ───────────────────────────────────────────────
create policy "faq: public read published" on public.faq_items for select using (is_published or public.is_staff());
create policy "faq: staff write" on public.faq_items for all using (public.is_staff()) with check (public.is_staff());
create policy "faq tr: public read" on public.faq_translations for select
  using (exists (select 1 from public.faq_items f where f.id = faq_id and (f.is_published or public.is_staff())));
create policy "faq tr: staff write" on public.faq_translations for all using (public.is_staff()) with check (public.is_staff());

create policy "content: public read" on public.content_blocks for select using (true);
create policy "content: staff write" on public.content_blocks for all using (public.is_staff()) with check (public.is_staff());
create policy "content tr: public read" on public.content_translations for select using (true);
create policy "content tr: staff write" on public.content_translations for all using (public.is_staff()) with check (public.is_staff());

create policy "instagram: public read published" on public.instagram_posts for select using (is_published or public.is_staff());
create policy "instagram: staff write" on public.instagram_posts for all using (public.is_staff()) with check (public.is_staff());

-- ── Quotes: staff only. NO anon policies → anon has zero access. ──────────
create policy "quotes: staff read" on public.quote_requests for select using (public.is_staff());
create policy "quotes: staff update" on public.quote_requests for update using (public.is_staff()) with check (public.is_staff());
create policy "quotes: admin delete" on public.quote_requests for delete using (public.is_admin());

create policy "attachments: staff read" on public.quote_attachments for select using (public.is_staff());
create policy "attachments: admin delete" on public.quote_attachments for delete using (public.is_admin());

create policy "notes: staff read" on public.quote_internal_notes for select using (public.is_staff());
create policy "notes: staff insert as self" on public.quote_internal_notes for insert
  with check (public.is_staff() and author_id = auth.uid());
create policy "notes: author or admin delete" on public.quote_internal_notes for delete
  using (author_id = auth.uid() or public.is_admin());

-- Defence in depth on top of RLS: browsers may never insert quote data, and staff
-- may only change the workflow status (not customer data or security fields).
revoke insert, update, delete on public.quote_requests from anon, authenticated;
grant update (status) on public.quote_requests to authenticated;
grant delete on public.quote_requests to authenticated; -- still limited to admins by RLS
revoke insert, update on public.quote_attachments from anon, authenticated;
revoke all on public.quote_requests, public.quote_attachments, public.quote_internal_notes from anon;
revoke all on sequence public.quote_ref_seq from anon, authenticated;

-- ── Storage buckets ───────────────────────────────────────────────────────
-- media: PUBLIC images for portfolio/services/logo (raster only — no SVG to avoid script injection).
-- quote-attachments: PRIVATE customer files. Uploads only via one-time signed URLs issued by the Edge Function.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('quote-attachments', 'quote-attachments', false, 20971520, null)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "media: staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy "media: staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "media: staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "media: staff list" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_staff());

create policy "quote files: staff read" on storage.objects for select to authenticated
  using (bucket_id = 'quote-attachments' and public.is_staff());
create policy "quote files: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'quote-attachments' and public.is_admin());

-- ── Dashboard helper (staff only) ─────────────────────────────────────────
create or replace function public.admin_overview()
returns json language sql stable security definer set search_path = public as $$
  select case when not public.is_staff() then null else json_build_object(
    'quotes_total', (select count(*) from public.quote_requests where kind = 'quote'),
    'contacts_total', (select count(*) from public.quote_requests where kind = 'contact'),
    'quotes_new', (select count(*) from public.quote_requests where status = 'new'),
    'projects_published', (select count(*) from public.portfolio_projects where is_published and not is_demo),
    'projects_draft', (select count(*) from public.portfolio_projects where not is_published),
    'services_published', (select count(*) from public.services where is_published),
    'services_total', (select count(*) from public.services),
    'notifications_unconfigured', (select count(*) from public.quote_requests where notification_status = 'not_configured'),
    'notifications_failed', (select count(*) from public.quote_requests where notification_status = 'failed')
  ) end;
$$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
