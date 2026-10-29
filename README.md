# Sound — GitHub + Supabase edition

Sound is a South African community platform where riders review equestrian
businesses. This version runs without Base44:

| Part | Where it runs |
|---|---|
| Website (React + Vite) | **GitHub Pages**, rebuilt automatically on every push to `main` |
| Database, logins, file uploads | **Supabase** (free tier is enough to start) |
| Business email notices | Supabase Edge Function `notify-business`, sending through **Resend** |
| Monthly Rosette Check | **GitHub Actions**, 06:00 SAST on the 1st of each month |

All pages are the same as the Base44 version. `src/api/base44Client.js` keeps the
old `base44.entities…` calls working, but they now go to your Supabase project.

---

## One-time setup

Allow about an hour. Do the steps in order.

### 1. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project. Pick
   the region closest to your users and save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste the whole of
   `supabase/migrations/0001_sound_schema.sql`, and click **Run**. This creates
   every table, the security rules, the two storage buckets (`public-files`,
   `private-files`) and the rating/rosette logic.
3. Go to **Project Settings → API** and note three values:
   - **Project URL**
   - **anon / publishable key** (safe to be public)
   - **service_role / secret key** (keep private, only used by the monthly job)

### 2. Set up logins

In Supabase, go to **Authentication**:

1. **URL Configuration**
   - *Site URL*: your live address, e.g. `https://<your-github-user>.github.io/<repo>/`
     (or `https://sound.co.za/` if you use your own domain).
   - *Redirect URLs*: add the same address with `**` at the end, e.g.
     `https://<your-github-user>.github.io/<repo>/**`, plus `http://localhost:5173/**`
     for testing on your computer.
2. **Email confirmation**: new members get Supabase's standard "Confirm signup" email
   and click its link. Nothing needs changing. (Supabase only allows editing email
   templates once your own SMTP sender is connected, see point 4.)
3. **Sign In / Providers → Google**: switch it on and paste a Google OAuth client ID
   and secret (created in Google Cloud Console → APIs & Services → Credentials). Supabase
   shows the callback URL to give Google.
4. **Emails / SMTP Settings**: Supabase's built-in email only sends a handful of
   messages an hour. Connect your own sender before launch. Resend's SMTP details
   work here, so one Resend account covers everything.

### 3. Set up business emails (optional until launch)

The `notify-business` function emails a business when a review is published, or
invites it to claim a profile.

1. Create a [Resend](https://resend.com) account, verify your sending domain and
   create an API key.
2. Deploy the function, either:
   - **with the Supabase CLI**: `npx supabase login`, `npx supabase link`, then
     `npx supabase functions deploy notify-business`, or
   - **in the dashboard**: **Edge Functions → Deploy a new function → Via editor**,
     name it `notify-business`, and paste in `index.ts` and `templates.ts` from
     `supabase/functions/notify-business/`.
3. Under **Edge Functions → Secrets**, add:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (for example `Sound <hello@yourdomain.co.za>`)
   - `SITE_URL` (your live address)

If this step is skipped, everything else works. The notices just won't send, and
the moderation screens ignore the failure, as they did on Base44.

### 4. Put the code on GitHub

1. Create a new repository on GitHub (for example `sound`). On a free GitHub plan,
   Pages needs the repository to be **public**.
2. Upload this folder to it. With GitHub Desktop: *File → Add local repository*,
   choose this folder, commit, then *Publish repository*. On the command line:
   ```bash
   git init -b main
   git add .
   git commit -m "Sound on GitHub Pages + Supabase"
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages** and set *Source* to **GitHub Actions**.
4. Go to **Settings → Secrets and variables → Actions**.
   - **Variables** tab: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
     To use your own domain, also add `CUSTOM_DOMAIN` (e.g. `sound.co.za`).
   - **Secrets** tab: add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the
     monthly job.
5. Open the **Actions** tab and run **Deploy to GitHub Pages** (or push any change).
   The site appears at `https://<you>.github.io/<repo>/` a minute or two later.

### 5. Make yourself an admin

1. Open the live site and create your account.
2. In Supabase **SQL Editor**, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign out and back in. The Admin desk (`/admin`) now works for you.

Memberships (Pro or Business) are granted from the Admin desk, exactly as before.

---

## Working on it on your computer

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev                  # opens on http://localhost:5173
```

Run `npm run lint` and `npm run build` before pushing. Every push to `main`
redeploys the site.

## Moving data across from Base44

The new database starts empty. To bring existing records across:

- **Records**: export each entity as CSV from the Base44 dashboard, then in Supabase
  open **Table Editor → (table) → Insert → Import data from CSV**. Column names match
  the Base44 field names.
- **Users**: passwords can't be moved, so people create their account again (or use
  Google). Record ids change too, so links between records, such as `claimed_by`,
  `reviewer` and `user_id`, need remapping. Ask Claude to write a one-off import
  script if you have more than a few records.
- **Files**: download them from Base44 and re-upload them through the app.

## Where things are

```
src/                      the app (same pages and components as before)
src/api/base44Client.js   data layer: Base44-style calls → Supabase
src/api/schema.js         field list for each table
src/lib/basePath.js       handles the site living at /<repo>/ on GitHub Pages
supabase/migrations/      database tables, security rules, rating logic
supabase/functions/       notify-business email function
supabase/email-templates/ original MJML sources of the two emails
scripts/monthly-check.mjs the Monthly Rosette Check
.github/workflows/        deploy + monthly jobs
```

## Good to know

- **Security** lives in the database rules, not the website. The anon key is
  public by design, and the rules decide who can read or change each record.
  They match the Base44 rules, with one addition: members can no longer
  publish their own review, approve their own business or change ratings.
  Only an admin can do that.
- **The free Supabase plan pauses projects after a period of inactivity.** Use a
  paid plan, or keep the site in use, once it's live.
- **GitHub switches off scheduled jobs after 60 days with no commits** to the
  repository. If that happens, re-enable the Monthly Rosette Check from the
  Actions tab.
- **POPIA**: your Supabase region decides where personal information is stored.
  If that's outside South Africa, it counts as a cross-border transfer (section 72),
  so cover it in the privacy notice and the legal review.
