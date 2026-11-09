-- ═══════════════════════════════════════════════════════════════════════════
-- NarReklam — core schema
-- Apply with: supabase db push   (or paste into the SQL editor in order)
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Helpers ───────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Profiles & roles ──────────────────────────────────────────────────────
-- Every auth user gets a profile with role 'none'. Only an existing admin
-- (or the SQL editor) can promote someone to 'editor' or 'admin'.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'none' check (role in ('none', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role checks used by RLS (security definer avoids recursive policy evaluation).
create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'none');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() in ('editor', 'admin');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() = 'admin';
$$;

-- ── Site settings (single row, id = 1) ────────────────────────────────────
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'NarReklam',
  logo_url text,
  phone text not null default '',
  phone_secondary text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address jsonb not null default '{"az":"","ru":"","en":""}',
  working_hours jsonb not null default '{"az":"","ru":"","en":""}',
  map_embed_url text not null default '',
  map_link text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  tiktok text not null default '',
  linkedin text not null default '',
  youtube text not null default '',
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();

-- ── Service taxonomy ──────────────────────────────────────────────────────
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order int not null default 0,
  is_published boolean not null default true,
  icon text not null default 'Layers',
  art text not null default 'design' check (art in ('design', 'space', 'print', 'production', 'promo', 'digital')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger service_categories_updated before update on public.service_categories for each row execute function public.set_updated_at();

create table public.service_category_translations (
  category_id uuid not null references public.service_categories (id) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  name text not null default '',
  tagline text not null default '',
  description text not null default '',
  seo_title text,
  seo_description text,
  primary key (category_id, locale)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.service_categories (id) on delete restrict,
  sort_order int not null default 0,
  is_published boolean not null default true,
  icon text not null default 'Layers',
  image_url text,
  quote_fields text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_category_idx on public.services (category_id, sort_order);
create trigger services_updated before update on public.services for each row execute function public.set_updated_at();

create table public.service_translations (
  service_id uuid not null references public.services (id) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  title text not null default '',
  short text not null default '',
  headline text not null default '',
  intro text not null default '',
  applications text[] not null default '{}',
  faq jsonb not null default '[]' check (jsonb_typeof(faq) = 'array'),
  keywords text not null default '',
  seo_title text,
  seo_description text,
  primary key (service_id, locale)
);

-- Sub-services ("what's included"), individually publishable.
create table public.service_items (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index service_items_service_idx on public.service_items (service_id, sort_order);

create table public.service_item_translations (
  item_id uuid not null references public.service_items (id) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  name text not null default '',
  primary key (item_id, locale)
);

-- ── Portfolio ─────────────────────────────────────────────────────────────
create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.service_categories (id) on delete set null,
  client_name text,
  project_date date,
  cover_image_id uuid,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index portfolio_public_idx on public.portfolio_projects (is_published, is_demo, sort_order);
create trigger portfolio_projects_updated before update on public.portfolio_projects for each row execute function public.set_updated_at();

create table public.portfolio_translations (
  project_id uuid not null references public.portfolio_projects (id) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  title text not null default '',
  summary text not null default '',
  description text not null default '',
  scope text not null default '',
  materials text not null default '',
  location text not null default '',
  primary key (project_id, locale)
);

create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects (id) on delete cascade,
  storage_path text,
  url text not null,
  alt jsonb not null default '{"az":"","ru":"","en":""}',
  caption jsonb not null default '{}',
  sort_order int not null default 0,
  focal_x smallint not null default 50 check (focal_x between 0 and 100),
  focal_y smallint not null default 50 check (focal_y between 0 and 100),
  width int,
  height int,
  created_at timestamptz not null default now()
);
create index portfolio_images_project_idx on public.portfolio_images (project_id, sort_order);

alter table public.portfolio_projects
  add constraint portfolio_cover_fk foreign key (cover_image_id) references public.portfolio_images (id) on delete set null;

create table public.project_services (
  project_id uuid not null references public.portfolio_projects (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (project_id, service_id)
);
create index project_services_service_idx on public.project_services (service_id);

-- ── FAQ ───────────────────────────────────────────────────────────────────
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger faq_items_updated before update on public.faq_items for each row execute function public.set_updated_at();

create table public.faq_translations (
  faq_id uuid not null references public.faq_items (id) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  question text not null default '',
  answer text not null default '',
  primary key (faq_id, locale)
);

-- ── Editable website copy (overrides for keys in src/i18n/editable.ts) ────
create table public.content_blocks (
  key text primary key,
  grp text not null default 'General',
  updated_at timestamptz not null default now()
);

create table public.content_translations (
  block_key text not null references public.content_blocks (key) on delete cascade,
  locale text not null check (locale in ('az', 'ru', 'en')),
  value text not null default '',
  primary key (block_key, locale)
);

-- ── Instagram (admin-managed gallery; no scraping) ────────────────────────
create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  post_url text not null check (post_url ~ '^https://(www\.)?instagram\.com/'),
  caption jsonb not null default '{}',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Quotation requests (private) ──────────────────────────────────────────
create sequence public.quote_ref_seq start 1001;

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'NR-' || to_char(now() at time zone 'Asia/Baku', 'YYMM') || '-' || lpad(nextval('public.quote_ref_seq')::text, 4, '0')
  ),
  kind text not null default 'quote' check (kind in ('quote', 'contact')),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'in_progress', 'completed', 'closed')),
  full_name text not null check (char_length(full_name) between 2 and 120),
  company text,
  phone text not null check (char_length(phone) <= 32),
  whatsapp text,
  email text not null check (char_length(email) <= 200),
  category_slug text,
  service_slug text,
  service_label text,
  description text not null check (char_length(description) between 1 and 5000),
  details jsonb not null default '{}',
  deadline date,
  contact_method text not null default 'phone' check (contact_method in ('phone', 'whatsapp', 'email')),
  locale text not null default 'az' check (locale in ('az', 'ru', 'en')),
  consent_at timestamptz not null,
  source_page text,
  ip_hash text,
  user_agent text,
  finalize_token_hash text,
  finalized_at timestamptz,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_configured')),
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_requests_status_idx on public.quote_requests (status, created_at desc);
create index quote_requests_ip_idx on public.quote_requests (ip_hash, created_at desc);
create trigger quote_requests_updated before update on public.quote_requests for each row execute function public.set_updated_at();

create table public.quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests (id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  status text not null default 'pending' check (status in ('pending', 'uploaded', 'rejected')),
  created_at timestamptz not null default now()
);
create index quote_attachments_quote_idx on public.quote_attachments (quote_id);

create table public.quote_internal_notes (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index quote_notes_quote_idx on public.quote_internal_notes (quote_id, created_at);
