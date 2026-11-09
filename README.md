# NarReklam — website

Multilingual (🇦🇿 Azerbaijani · 🇷🇺 Russian · 🇬🇧 English) website for **NarReklam**, an advertising, design, printing and production company in Azerbaijan, with a secure admin dashboard.

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS v4 · React Router · Motion · Lucide
- **Backend:** Supabase (Postgres + Row Level Security, Auth, Storage, one Edge Function)
- **Hosting:** GitHub Pages (static) — portable to Cloudflare Pages / Vercel / Netlify without code changes

---

## 1. What's included

| Area | Status |
|---|---|
| Homepage (hero, 6 category cards, featured work, capabilities, process, product showcase, why us, quote CTA, Instagram, contact) | ✅ |
| All services → 6 categories → 18 service pages, **every listed sub-service**, in 3 languages | ✅ |
| Service pages: hero, what's included, applications, request parameters, related projects, FAQ, related services, CTA preselecting the service | ✅ |
| Portfolio listing (filters, search, load-more, masonry) + project pages (gallery, lightbox, swipe, share) | ✅ |
| About, Contact (+ working contact form), FAQ, Search, Privacy, Cookie policy, custom 404 | ✅ |
| Quote request system: context-sensitive fields, file uploads to **private** storage, reference number, email notification, WhatsApp follow-up | ✅ (needs Supabase + Resend) |
| Floating WhatsApp button with localized, service-aware messages | ✅ (needs number) |
| Site search across all 3 languages with Azerbaijani diacritic folding (`lazer kesim` → “Lazer kəsim”) and synonyms | ✅ |
| Admin dashboard: overview, requests (status, notes, attachments), services & sub-services, categories, portfolio + image management, website copy, FAQ, Instagram gallery, company settings | ✅ (needs Supabase) |
| SEO: per-route static HTML, unique localized titles/descriptions, canonical, hreflang, Open Graph, JSON-LD, sitemap.xml, robots.txt | ✅ |

### Honesty rules built in
- **No invented facts.** No years in business, client names, metrics, awards or certifications. Copy avoids promising specific technologies/material specs and does not claim architectural/engineering licences, app development, paid-media buying, video production, SEO consulting or influencer management.
- **Contact details are placeholders** until you enter them in *Admin → Company settings*. Empty values show “Tezliklə əlavə olunacaq / Coming soon”.
- **Temporary wordmark** (`src/components/ui/Logo.tsx`) is labelled as temporary and is replaced automatically when you upload your logo.
- **No stock photos presented as work.** Where no photo is uploaded, the site uses clearly abstract, code-generated illustrations, labelled “İllüstrativ təsvir”.
- **Demo portfolio projects** are labelled “Demo”, only appear when `VITE_SHOW_DEMO=true`, and are blocked from the public by RLS (`is_demo`). The production workflow forces `VITE_SHOW_DEMO=false`.
- **No fake submit.** Without the backend, the quote form clearly says online requests aren’t connected and points to WhatsApp/phone. Missing email configuration is shown in the admin dashboard.
- **No fake Instagram feed.** Instagram is an admin-managed gallery of your own photos linking to real posts (the Graph API needs a Business account + Meta app review; it can be added later).

---

## 2. Architecture

```
Browser ──► GitHub Pages (static HTML/JS/CSS, one prerendered page per route & language)
   │
   ├──► Supabase PostgREST (anon key)     → read published content (RLS-filtered)
   ├──► Supabase Auth                      → admin login (no public sign-up)
   ├──► Supabase Storage  media (public)   → portfolio/service images
   │                      quote-attachments (PRIVATE) → customer files, signed URLs only
   └──► Edge Function quote-submit         → validates & stores quotes, issues one-time upload URLs,
                                             checks file signatures, sends email via Resend
```

**Why this split:** GitHub Pages can only serve static files. Everything dynamic lives in Supabase; the service-role key exists **only** inside the Edge Function. The browser only ever has the public anon key, and every table is protected by Row Level Security.

### Folder map
```
src/
  admin/              Admin dashboard (lazy-loaded; auth gate, CRUD pages)
  components/         layout (header, mega-menu, footer, search, WhatsApp), home sections, UI
  config/             env access + company placeholders
  content/catalog/    Default service catalog (az/ru/en) — also generates supabase/seed.sql
  content/demo.ts     Demo projects (labelled) + default FAQ
  data/               DataProvider (live data with bundled fallback) + row↔model mappers
  i18n/               az.ts (source), ru.ts, en.ts, admin-editable keys
  lib/                types, paths, search, SEO, quote submission, art generator
  pages/              Public pages
  theme/brand.ts      PROVISIONAL brand tokens (also in src/styles/index.css @theme)
scripts/
  prerender.ts        Static HTML per route + sitemap/robots/404 (runs after vite build)
  generate-seed.ts    Catalog → supabase/seed.sql
  serve-like-pages.mjs  Local server that behaves like GitHub Pages
supabase/
  migrations/         Schema + RLS + storage buckets/policies
  functions/quote-submit/  Edge Function
  seed.sql            Generated default content (idempotent)
```

### Routes
`/az/` (default), `/ru/`, `/en/` + `services/`, `services/:category/`, `services/:category/:service/`, `portfolio/`, `portfolio/:slug/`, `about/`, `quote/?service=…`, `contact/`, `faq/`, `search/?q=…`, `privacy/`, `cookies/` · `/admin/` (not localized, noindex).
The language switcher keeps visitors on the equivalent page.

---

## 3. Local development

```bash
npm install
cp .env.example .env.local     # fill in Supabase values when you have them
npm run dev                    # http://localhost:5173/az/
```

Without Supabase values the site runs on the bundled catalog (and demo projects if `VITE_SHOW_DEMO=true`), the quote form reports that it isn't connected, and `/admin` shows setup instructions.

```bash
npm run build                  # typecheck + Vite build + prerender
node scripts/serve-like-pages.mjs /        # preview dist like GitHub Pages (use /narreklam/ if built with that base)
npm run seed:generate          # regenerate supabase/seed.sql after editing src/content/catalog
```

---

## 4. Deployment — step by step

### Step 1 · Create the GitHub repository
1. On GitHub: **New repository** → e.g. `narreklam` (public or private; Pages on private repos needs a paid plan).
2. Don't add a README/license (this project has them).

### Step 2 · Add the project
```bash
cd narreklam
git init
git add .
git commit -m "NarReklam website"
git branch -M main
git remote add origin https://github.com/<your-user>/narreklam.git
git push -u origin main
```

### Step 3 · Create the Supabase project
1. <https://supabase.com> → **New project** (region: Frankfurt `eu-central-1` is closest to Azerbaijan).
2. Save the database password somewhere safe.
3. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key. *Never* use the `service_role` key in the frontend.

### Step 4 · Apply the database migrations
**Option A — SQL editor (no tools needed):** open *SQL Editor* and run, in order:
1. `supabase/migrations/20261109000001_schema.sql`
2. `supabase/migrations/20261109000002_security.sql`
3. `supabase/seed.sql` (default catalog, FAQ, settings row — safe to re-run)

**Option B — Supabase CLI:**
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
psql "<connection string from Project Settings → Database>" -f supabase/seed.sql   # or paste seed.sql into the SQL editor
```

### Step 5 · Configure authentication
*Authentication → Providers → Email*: keep Email enabled.
*Authentication → Sign In / Providers*: **turn OFF “Allow new users to sign up”.** Admins are invited, never self-registered.
*Authentication → URL Configuration*:
- **Site URL:** `https://<your-user>.github.io/narreklam/admin/` (later your custom domain)
- **Redirect URLs:** add the same URL plus `http://localhost:5173/admin/`

### Step 6 · Create the first administrator
1. *Authentication → Users → **Invite user*** (or *Add user* with a password) for your email.
2. Open the invite email and set your password (you'll land on `/admin/`).
3. In the SQL editor, promote the account:
```sql
update public.profiles set role = 'admin' where email = 'you@your-domain.az';
```
Roles: `admin` (everything, incl. company settings and deleting requests), `editor` (content, services, portfolio, requests; no settings/deletes), `none` (default — no access). Promote further team members the same way.

### Step 7 · Storage
The security migration creates both buckets automatically:
- `media` — **public**, images only (JPG/PNG/WebP/AVIF, ≤10 MB). Admin uploads are resized to max 2400 px WebP in the browser.
- `quote-attachments` — **private**, ≤20 MB per file. Customers upload via one-time signed URLs; only staff can read; downloads use 2-minute signed links and non-images are forced to download (never rendered).

Check *Storage* shows both buckets. Nothing else to do.

### Step 8 · Deploy the Edge Function & configure quote notifications
1. Create a free account at <https://resend.com>, verify your sending domain (or test with `onboarding@resend.dev`, which can only email your own address), and create an API key.
2. Deploy and set secrets:
```bash
supabase functions deploy quote-submit --no-verify-jwt
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  QUOTE_NOTIFY_EMAIL=info@your-domain.az \
  QUOTE_FROM_EMAIL="NarReklam <noreply@your-domain.az>" \
  ALLOWED_ORIGINS=https://<your-user>.github.io,http://localhost:5173 \
  QUOTE_IP_SALT=$(openssl rand -hex 16)
```
`--no-verify-jwt` is intentional: the function does its own validation/authorization and must accept the public key from the browser.
If the email secrets are missing, requests are still saved and the dashboard shows **“Email notifications are not configured”** — nothing pretends an email was sent.

What the function enforces: required fields & formats, consent, honeypot, max 8 files, allowed extensions (PDF, JPG, PNG, SVG, AI, EPS, PSD, ZIP), ≤20 MB each, per-IP rate limit (5 per 15 min, salted hash — raw IPs are never stored), file **magic-byte verification** after upload (mismatches are deleted and marked rejected), one-time finalize token.

### Step 9 · Deploy with GitHub Pages
1. Repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon/publishable key (public by design; RLS protects data)
3. **Actions → Deploy to GitHub Pages → Run workflow** (it also runs on every push to `main` and nightly).

The workflow automatically uses base path `/<repo>/` and site URL `https://<user>.github.io/<repo>` (or `/` for a `<user>.github.io` repo or a custom domain).

### Step 10 · Fill in your real data (Admin)
Open `https://<user>.github.io/narreklam/admin/` and:
1. **Company settings:** logo, phone, WhatsApp, email, address, hours, Instagram & other socials, map link.
2. **Portfolio:** add real projects, upload photos, set cover, focal point, alt text (3 languages), link services, publish, mark featured.
3. **Services / Categories:** review copy, enable/disable sub-services, upload real images.
4. **Website content / FAQ / Instagram:** adjust as needed.

Changes are live immediately on the site. The prerendered (search-engine) HTML is refreshed on the next deploy — nightly automatically, or run the workflow manually after big edits.

### Step 11 · Test the live website
- [ ] `/` redirects to `/az/`; switching AZ/RU/EN stays on the same page
- [ ] Refresh on a deep URL, e.g. `/ru/services/printing-polygraphy/polygraphy/` — loads correctly
- [ ] Search: try `vizitka`, `lazer kesim`, `оклейка`, `DTF`
- [ ] Submit a quote with a PDF + JPG → success screen with `NR-YYMM-####`, email arrives, request + files visible in Admin
- [ ] Try uploading a renamed `.exe` as `.pdf` → it is rejected after upload
- [ ] Log out → `/admin/` asks for login; an account with role `none` sees “not authorised”
- [ ] WhatsApp button opens the right number with the service name on service pages
- [ ] Lighthouse (mobile) on the deployed URL; check `sitemap.xml` and `robots.txt`
- [ ] Submit `sitemap.xml` in Google Search Console and Yandex Webmaster

### Step 12 · Connect a custom domain later (no rebuild of code)
1. Repository **Variables** → add `CUSTOM_DOMAIN` = `narreklam.az` (or `www.narreklam.az`).
2. DNS at your registrar:
   - apex `narreklam.az`: four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and optional `AAAA` `2606:50c0:8000::153` … `8003::153`)
   - `www`: `CNAME` → `<your-user>.github.io`
3. **Settings → Pages → Custom domain** → enter the domain → **Enforce HTTPS** once the certificate is issued.
4. Re-run the workflow (base path becomes `/`, canonical URLs and sitemap switch to the domain).
5. Update Supabase **Site URL / Redirect URLs** and the function's `ALLOWED_ORIGINS` to the new domain.

---

## 5. SEO notes (important)

Client-side rendering alone does **not** guarantee good indexing. This project therefore **prerenders** every public route at build time (`scripts/prerender.ts`): each of the ~100 URLs gets its own HTML with localized title/description, canonical, hreflang (az/ru/en + x-default), Open Graph, JSON-LD (Organization, Service, FAQPage, BreadcrumbList, CreativeWork) and real crawlable text + internal links. The sitemap includes hreflang alternates.

Limitations on GitHub Pages:
- Projects/services added in the admin get static HTML only after the next build (nightly or manual run). Until then they still work for visitors via the 404 shell, but that response has HTTP status 404, which search engines won't index.
- No server-side redirects or custom headers (e.g. security headers, cache rules).

When SEO becomes a bigger priority, move to **Cloudflare Pages** or **Vercel** (same build command `npm run build`, output `dist`, set `VITE_BASE_PATH=/`), and add a deploy hook triggered from the admin, or adopt full SSR/SSG later. No application code needs to change.

Keyword targeting is built into service copy, titles and synonyms (e.g. *reklam şirkəti, banner çapı, vizitkart çapı, vinil çapı, CNC kəsim, lazer kəsim, plotter kəsim, açıq hava reklamları, avtomobil brendinqi, DTF çap, promo məhsullar* and Russian/English equivalents such as *наружная реклама Баку, печать баннеров, оклейка авто / signage Baku, vehicle wrap, banner printing*). Edit titles/descriptions per service in the admin (SEO section).

---

## 6. Branding — replacing provisional assets

| What | Where |
|---|---|
| Logo | Admin → Company settings → Logo (replaces the temporary wordmark everywhere) |
| Colors | `src/styles/index.css` (`@theme` tokens) + `src/theme/brand.ts` |
| Fonts | `src/styles/index.css` imports (`@fontsource-variable/*`) + `--font-display` / `--font-sans`. Current: Unbounded + Manrope — both cover Azerbaijani (Ə ə İ ı Ğ ğ Ş ş Ç ç Ö ö Ü ü) and Cyrillic |
| Social image | `public/og-image.png` (1200×630) — provisional; regenerate with `python3 scripts/make-og-image.py` or replace |
| Favicon | `public/favicon.svg` |
| Category/service images | Admin → Categories / Services |

---

## 7. Costs & free-tier limits (check current pricing)

| Service | Free tier (approx.) | When you might pay |
|---|---|---|
| GitHub Pages | Free for public repos; 1 GB site, ~100 GB/month bandwidth soft limit | Private repo needs GitHub Pro/Team |
| Supabase Free | 500 MB database, 1 GB file storage, 5 GB egress, 500k Edge Function calls/month; **projects pause after ~1 week of inactivity** | Pro (~$25/month) for no pausing, daily backups, more storage — recommended once live |
| Resend | 3,000 emails/month, 100/day | Paid plan above that |
| Domain | — | `.az` domain registration (annual) |

Portfolio photos are the main storage driver — client-side WebP compression keeps them small.

---

## 8. Security summary
- RLS on every table; anonymous users can only read **published, non-demo** content.
- No anon/browser access to quotes, attachments or notes (not even insert) — only the Edge Function (service role) writes them.
- Staff can change a request's **status** only (column-level grant); customer data and security fields are immutable from the browser.
- Users can't change their own role; only admins can promote.
- Public sign-up disabled; admin routes are noindex and excluded in robots.txt.
- Uploaded files: private bucket, signed one-time uploads, extension + size + magic-byte checks, forced download for non-images, never executed.
- Secrets live only in Supabase function secrets / GitHub variables — `.env*` files are git-ignored.

Recommended extras: enable Supabase **MFA** for admin accounts, enable **leaked-password protection**, and consider Cloudflare Turnstile on the quote form if spam appears.

---

## 9. Verified during development
- `tsc -b` and `npm run build` pass; prerender writes 102 localized pages + sitemap (99 URLs).
- Migrations, seed (twice, idempotent) and RLS behaviour were executed against Postgres (PGlite) with simulated `anon`, non-staff and admin users.
- Public site tested in the browser at desktop and mobile widths, in all three languages, including direct loads of nested routes under a `/narreklam/` sub-path.
- **Not yet run:** the Edge Function (requires a Supabase project / Deno runtime) and a real end-to-end quote submission with email — do Step 11 after deployment.
