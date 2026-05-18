# Levertide — Website Spec & Setup

Premium marketing site for **Levertide**, an AI automation agency that builds custom
automation systems for recruitment agencies (US · UK · Australia).

**Goal:** generate booked discovery calls from recruitment agency owners.

---

## 1. What's in this project

```
levertide/
├── index.html        # Single-page site (all sections)
├── css/styles.css     # Premium light theme, gradients, animations, responsive
├── js/main.js          # Navbar, mobile menu, scroll reveal, form handling
├── .env.example        # Environment variables (copy to .env)
├── .gitignore
└── README.md           # This file
```

No build step. It's static HTML/CSS/JS — open `index.html` or serve the folder.

---

## 2. Page structure (built)

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Hero** | Pain + outcome headline ("Stop Losing Placements to Manual Work."), dual CTA, dashboard mockup |
| 2 | **Tech Stack Band** | Logo strip — n8n, Airtable, Notion, Slack, OpenAI, Claude, Gmail, CRM |
| 3 | **Services** | 4 outcome-framed cards: AI Screening, BD Lead Gen, CRM Automation, Client Onboarding |
| 4 | **How It Works** | 3-step process: Audit → Build → Launch |
| 5 | **Workflow Demos** | Real automation flows (no fake testimonials): CV parsing, AI scoring, cold outreach, follow-ups, onboarding |
| 6 | **Sample Systems (Work Wall)** | 4 representative builds with tools used — clearly labeled "Sample build", no fake clients/dates |
| 7 | **Why Us** | Niche specialization, custom systems, time savings, scalability, less admin, no lock-in |
| 8 | **Mid-page CTA Band** | Persistent conversion prompt → Book a Free Call |
| 9 | **FAQ** | Objection handling: custom?, setup time, technical knowledge, integrations, cost |
| 10 | **Final CTA** | Cal.com embed + contact form |
| – | **Footer** | Brand, region note, nav, copyright |

Reference site **nisabms.com** was used to adopt proven conversion patterns: a
standalone tech-stack logo band, a project-style "work wall", repeated booking
CTAs, and scannable benefit cards — kept on our premium light theme and without
NISA's testimonials (we don't fabricate proof; the work wall is labeled "Sample build").

### Copy & positioning notes
- Tone: confident, premium, direct, minimal fluff.
- Outcome over tooling — every service card states the business result, not the tech.
- **No fabricated testimonials.** Social proof is replaced with concrete workflow demos
  and measurable promises (hours saved / placements protected).
- Pricing is intentionally *not* published — engagements start with a one-time build +
  optional monthly retainer, scoped on the strategy call (value-based selling).

---

## 3. Environment setup

### Prerequisites
- Any static host, or Node ≥ 18 for local serving (Node 24 detected on this machine).

### Local preview

```powershell
# From the project root
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:3000` (or `:8080`).

### Environment variables

Copy `.env.example` → `.env` and fill in your values.

| Variable | Used for | Where to set |
|----------|----------|--------------|
| `CAL_LINK` | Your Cal.com discovery-call link (`username/event-slug`) | `index.html` → `Cal.ns[...]("inline", { calLink })` |
| `FORM_ENDPOINT` | Contact-form POST target (Formspree / n8n webhook / API) | injected as `window.LEVERTIDE_FORM_ENDPOINT` |
| `CONTACT_EMAIL` | Fallback email shown on send failure | `js/main.js` + footer |
| `SITE_URL` | Canonical/OG URL | `index.html` meta tags |

> This is a static site, so `.env` values are **not** auto-loaded by the browser.
> See section 4 for how to apply each one.

---

## 4. Wiring the integrations

### A. Cal.com (booking)
1. Create a Cal.com event type, e.g. a 30-min "Strategy Call". Your link will be
   `cal.com/<your-username>/<event-slug>`.
2. In `index.html`, find the Cal.com embed script in the `#book` section and
   replace the `calLink` value:
   ```js
   Cal.ns["strategy-call"]("inline", {
     elementOrSelector: "#cal-booking",
     calLink: "<your-username>/<event-slug>",   // ← change this
     layout: "month_view"
   });
   ```
   The embed is already themed dark with the brand colour
   (`cssVarsPerTheme.dark["cal-brand"] = #6C8CFF`) to match the site.

### B. Contact form endpoint
Pick one and set the endpoint so `window.LEVERTIDE_FORM_ENDPOINT` is defined
before `js/main.js` runs (add a small inline `<script>` in `index.html` `<head>`,
or hardcode `ENDPOINT` in `js/main.js`):

```html
<script>window.LEVERTIDE_FORM_ENDPOINT = "https://formspree.io/f/XXXX";</script>
```

Options:
- **Formspree / Getform** — fastest, no backend.
- **n8n webhook** — recommended for an automation agency: form → n8n → CRM + Slack
  notification + auto-reply email. Eat your own dog food.
- **Custom API** — POST JSON `{ name, email, agency, size, message }`.

If no endpoint is set, the form still validates and shows a success message
(submission is captured client-side only — good for design preview).

### C. Analytics (optional)
Add your tag (Plausible / GA4 / PostHog) before `</head>`. Track the
`Book a Free Strategy Call` clicks and the Cal.com `bookingSuccessful`
event as the primary conversion.

---

## 5. Deploy

**Configured host: Netlify** — `netlify.toml` is committed and handles:
- Publishing the repo root (no build step)
- `www.levertide.com` → `levertide.com` 301 redirect (matches the `canonical` tag)
- Security headers (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)
- Long-cache for `/css` and `/js`, always-revalidate for HTML

To deploy: drag the folder into Netlify, or connect the Git repo (it auto-detects
`netlify.toml`). Add `FORM_ENDPOINT` either as an inline `<script>` in the HTML
`<head>` or via a Netlify build snippet.

> **CSP note:** no `Content-Security-Policy` is set. The site loads external
> origins — `app.cal.com` (booking widget) and
> `fonts.googleapis.com`/`fonts.gstatic.com`. If you add a CSP later, you must
> allowlist these or the Cal.com booking widget (your primary conversion) breaks.

Other hosts also work (Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront) —
you'd swap `netlify.toml` for that platform's equivalent config.

### Continuous deploy (Git → Netlify) — preferred

This repo is connected to a **private GitHub repo** and Netlify deploys from it
automatically. This replaces the error-prone manual zip upload (which once
shipped a broken deploy missing `css/` and `js/`).

**One-time Netlify link (web dashboard — needs your Netlify + GitHub login):**
1. Netlify → the site → **Site configuration → Build & deploy → Continuous
   deployment → Link repository** (or **Add new site → Import from an existing
   project → GitHub**, then delete the old drag-drop site).
2. Authorize Netlify's GitHub app and pick the private **`levertide`** repo.
3. Confirm build settings — **Build command: empty**, **Publish directory: `.`**
   (Netlify reads these from `netlify.toml` automatically).
4. Deploy. Verify the live URL renders **styled** (CSS/JS resolve).

**Ongoing workflow — every change is now:**
```bash
# edit files...
git add -A
git commit -m "Describe the change"
git push          # Netlify auto-builds and deploys in ~1-2 min
```

No more zipping. `levertide-deploy.zip` is gitignored and kept only as a manual
fallback. `gh` CLI (portable, `%LOCALAPPDATA%\Programs\gh-cli\bin`, on user
PATH) was used to create the repo.

### Connecting the domain (levertide.com)

Production domain is **levertide.com** (already set as `SITE_URL`, canonical, and
OG/Twitter URL).

| Host | DNS to add at your registrar |
|------|------------------------------|
| Netlify | Add custom domain `levertide.com`; point apex `A` → Netlify load balancer (or use Netlify DNS), `www` `CNAME` → your-site.netlify.app |
| Vercel | Add `levertide.com`; apex `A` → `76.76.21.21`, `www` `CNAME` → `cname.vercel-dns.com` |
| Cloudflare Pages | Add custom domain; if domain is on Cloudflare, records are created automatically |

- Set `www.levertide.com` to **redirect** to the apex (or vice-versa) — pick one
  canonical host so SEO/OG stays consistent with the `canonical` tag.
- HTTPS: all three hosts issue a free auto-renewing certificate once DNS resolves.
- Email: `hello@levertide.com` is referenced on the form and in `.env`. Set up a
  mailbox or forwarding for it (e.g. Google Workspace, or registrar email
  forwarding) before launch.

Pre-launch checklist:
- [ ] `levertide.com` DNS pointed at host; HTTPS cert issued
- [ ] `www` ↔ apex redirect configured (one canonical host)
- [ ] `hello@levertide.com` mailbox / forwarding live
- [ ] Cal.com `calLink` points to your real event
- [ ] Form endpoint set and tested (check it lands in your CRM/inbox)
- [ ] `CONTACT_EMAIL` / footer reflect your real address
- [ ] `SITE_URL` + OG meta updated for link previews
- [ ] Test on mobile (sticky nav, hamburger menu, Cal.com embed height)
- [ ] Analytics installed and conversion events firing

---

## 6. Design system reference

Theme: **premium light** (white / soft-grey backgrounds, dark navy text).

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#FFFFFF` | Page background |
| `--bg-alt` | `#F5F7FB` | Alternating sections |
| `--text` | `#0E1530` | Body / headings |
| `--brand` | `#5468FF` | Primary accent |
| `--brand-2` | `#8B5CF6` | Gradient mid |
| `--accent` | `#0FB99B` | Outcomes / success |
| `--grad` | blue → purple → teal | Buttons, headings, highlights |
| Fonts | Space Grotesk (display), Inter (body) | — |

Responsive: mobile-first, breakpoints at 960px and 760px.
Animations: scroll-reveal (IntersectionObserver) + shimmering gradient
text/buttons (`gradientShift`) + floating hero/CTA glows (`floatGlow`).
All animation respects `prefers-reduced-motion`.

---

*Built as a high-ticket-positioned, conversion-focused single page. Keep pricing off
the page — sell it on the call.*
