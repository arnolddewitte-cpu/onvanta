# ONVANTA MASTERPLAN v6

_Bijgewerkt: 1 april 2025_

---

## Wat is Onvanta?

SaaS platform voor gestructureerde employee onboarding. HR-teams bouwen templates met fases, stappen en contentblokken. Medewerkers doorlopen hun onboarding stap voor stap. Managers monitoren voortgang en keuren stappen goed. Gebouwd op Next.js 16, Supabase (PostgreSQL), Stripe en Resend.

---

## Tech Stack

| Laag | Keuze |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Supabase (PostgreSQL, Frankfurt) |
| Auth | Magic links via Resend + JWT (jose) |
| Email | Resend (noreply@onvanta.io) |
| Payments | Stripe (subscriptions + webhooks) |
| Deployment | — |
| Styling | Inline styles + DM Sans / Georgia fonts |

---

## Database Schema (Prisma)

```
Company
  id, name, slug, logoUrl
  plan: starter | pro | enterprise
  status: trial | active | paused | cancelled
  trialEndsAt
  stripeCustomerId        ← nieuw v6
  stripeSubscriptionId    ← nieuw v6
  createdAt, updatedAt

User
  id, email, name, avatarUrl
  role: super_admin | company_admin | manager | employee
  companyId → Company
  createdAt, updatedAt

MagicLinkToken            ← alleen in Supabase (niet in Prisma)
  token, userId, expires, used

Template
  id, name, description, companyId, published

TemplatePhase
  id, templateId, title, order

TemplateStep
  id, phaseId, title, description, order

StepBlock
  id, stepId, type, title, required, order, config (JSON)
  types: video | text | document | task | flashcards |
         questionnaire | meeting | acknowledgement | manager_approval

OnboardingInstance
  id, templateId, employeeId, managerId, companyId
  status: scheduled | active | at_risk | completed | paused | cancelled
  startDate, endDate, progressPct

StepProgress, Task, FlashcardSet, Flashcard, FlashcardReview
```

---

## Auth Flow

### Magic Link Login (bestaande gebruikers)

```
1. /login
   └─ gebruiker vult email in

2. POST /api/auth/magic-link
   ├─ zoekt User op via email
   ├─ genereert UUID token (15 min geldig)
   ├─ slaat op in MagicLinkToken tabel
   └─ stuurt email via Resend met link naar /api/auth/verify?token=...

3. GET /api/auth/verify?token=...
   ├─ zoekt token op (used=false, niet verlopen)
   ├─ markeert token als used=true
   ├─ maakt JWT aan (30 dagen, HS256) met: sub, email, role, companyId
   ├─ zet cookie: next-auth.session-token (httpOnly, secure in prod)
   └─ redirect op basis van rol:
        super_admin  → /super
        company_admin → /admin
        manager      → /manager
        employee     → /dashboard
```

### Signup Flow (nieuwe gebruikers)

```
1. /signup — stap 1: naam + work email
2. /signup — stap 2: bedrijfsnaam + teamgrootte

3. POST /api/signup
   ├─ valideert velden (name, email, company verplicht)
   ├─ checkt of email al bestaat in User tabel
   ├─ maakt Company aan (status: trial, plan: pro, slug gegenereerd)
   ├─ maakt User aan (role: company_admin, gekoppeld aan company)
   ├─ genereert magic link token (1 uur geldig)
   └─ stuurt welkomstmail via Resend met inloglink

4. Succespagina toont email + "what's next" instructies
```

---

## Stripe Webhook Flow

**Endpoint:** `POST /api/webhooks/stripe`

Verificatie via `stripe-signature` header + `STRIPE_WEBHOOK_SECRET`.

| Event | Actie op Company |
|---|---|
| `customer.subscription.created` | Update `status`, `plan`, `stripeSubscriptionId`, `trialEndsAt` |
| `customer.subscription.updated` | Update `status`, `plan`, `trialEndsAt` |
| `customer.subscription.deleted` | `status: cancelled`, wist `stripeSubscriptionId` |
| `invoice.payment_succeeded` | `status: active` |
| `invoice.payment_failed` | `status: paused` |

**Status mapping (Stripe → Onvanta):**
- `active` / `trialing` → `active`
- `past_due` / `unpaid` → `paused`
- `canceled` / `incomplete_expired` → `cancelled`

**Plan mapping via price IDs:**
- `STRIPE_PRICE_STARTER_MONTHLY` / `_YEARLY` → `starter`
- `STRIPE_PRICE_PRO_MONTHLY` / `_YEARLY` → `pro`

---

## Gebouwde Pagina's

### Marketing (publiek)

| Route | Inhoud |
|---|---|
| `/` | Homepage: hero, features, pricing CTA |
| `/pricing` | Prijstabel met maandelijks/jaarlijks toggle (Starter €9/€7, Pro €15/€12, Enterprise custom) |
| `/about` | Bedrijfsverhaal, missie, waarden |
| `/contact` | Contactformulier + bedrijfsinfo |
| `/privacy` | Privacybeleid (GDPR, Supabase Frankfurt) |
| `/terms` | Algemene voorwaarden |
| `/login` | Magic link loginformulier |
| `/signup` | Twee-staps signup met trial activatie |

### Employee (role: employee)

| Route | Inhoud |
|---|---|
| `/dashboard` | Onboarding voortgang, openstaande taken, flashcards |
| `/onboarding` | Faseoverzicht (Preboarding, Dag 1, Week 1, Maand 1) |
| `/onboarding/[stepId]` | Stapdetail met contentblokken (video, tekst, taak, acknowledgement, etc.) |
| `/tasks` | Takenlijst met filters: alles / vandaag / te laat / gedaan |
| `/flashcards` | Spaced repetition kaarten (kennis herhaling) |

### Manager (role: manager)

| Route | Inhoud |
|---|---|
| `/manager` | Teamoverzicht: voortgang, at-risk signalering, flashcard-scores |
| `/manager/[id]` | Medewerker detail: profiel, voortgang, quizscores, taken, acties |
| `/manager/approvals` | Goedkeuringsworkflow voor manager sign-offs op stappen |

### Admin (role: company_admin)

| Route | Inhoud |
|---|---|
| `/admin` | Statistieken, snelle acties, actieve onboardings |
| `/admin/settings` | Bedrijfsinstellingen, abonnementsbeheer, danger zone |
| `/admin/users` | Gebruikersbeheer + uitnodigmodal (3 rollen) |
| `/admin/templates` | Templateoverzicht: aanmaken / bewerken / inzien |
| `/admin/templates/[id]` | Templatedetail: fases, stappen, flashcard-sets |
| `/admin/templates/[id]/edit` | Volledige template editor: fases en stappen toevoegen/verwijderen |
| `/admin/onboardings/new` | 3-staps wizard: medewerker + template + manager/datum |

### Super Admin (role: super_admin)

| Route | Inhoud |
|---|---|
| `/super` | — nog niet gebouwd |

---

## API Routes

| Route | Method | Beschrijving |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/auth/magic-link` | POST | Genereer + stuur magic link (15 min) |
| `/api/auth/verify` | GET | Valideer token, maak sessie, redirect op rol |
| `/api/signup` | POST | Registreer bedrijf + admin user, stuur welkomstmail |
| `/api/webhooks/stripe` | POST | Verwerk Stripe subscription + invoice events |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=          ← nog leeg
STRIPE_SECRET_KEY=               ← nog leeg
STRIPE_WEBHOOK_SECRET=           ← nog leeg
STRIPE_PRICE_STARTER_MONTHLY=price_1TFAZXHBcjRn9vsfaQekD6ps
STRIPE_PRICE_STARTER_YEARLY=price_1TFAZXHBcjRn9vsfKLiAv8Lu
STRIPE_PRICE_PRO_MONTHLY=price_1TFAahHBcjRn9vsfIM15KoJN
STRIPE_PRICE_PRO_YEARLY=price_1TFAahHBcjRn9vsfSMYsHPMd

# Resend
RESEND_API_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## Nog te bouwen

### Kritiek (blocker voor launch)

- [ ] **Sessie middleware** — routes beveiligen per rol (nu zijn alle `/admin`, `/manager`, `/dashboard` routes openbaar toegankelijk zonder auth check)
- [ ] **Stripe checkout** — `/api/checkout` endpoint om een Stripe Checkout Session aan te maken bij upgrade van trial naar betaald plan
- [ ] **`stripeCustomerId` opslaan** — bij signup of eerste checkout een Stripe Customer aanmaken en ID opslaan op Company
- [ ] **`/super` admin panel** — super_admin dashboard voor Onvanta zelf (alle bedrijven, MRR, churn)
- [ ] **MagicLinkToken in Prisma schema** — tabel is alleen in Supabase aangemaakt, nog niet gesynchroniseerd in schema.prisma
- [ ] **Trial-expiry enforcement** — blokkeer toegang wanneer `trialEndsAt` verstreken is en geen actief abonnement

### Belangrijk (kort na launch)

- [ ] **Gebruiker uitnodigen API** — `/api/admin/invite` endpoint achter de uitnodigmodal in `/admin/users`
- [ ] **Onboarding starten API** — `/api/admin/onboardings` endpoint achter de wizard in `/admin/onboardings/new`
- [ ] **Voortgang opslaan API** — stappen als voltooid markeren, `StepProgress` bijwerken
- [ ] **Flashcard review API** — resultaten opslaan, `nextReview` berekenen (spaced repetition algoritme)
- [ ] **Manager approval API** — goedkeuringen verwerken in `/manager/approvals`
- [ ] **Deployment** — Vercel + productie-omgeving met env vars + domein (onvanta.io)
- [ ] **Email templates** — mooiere HTML voor uitnodigings- en herinneringsmails

### Nice to have

- [ ] **Notificaties** — email herinneringen voor verlopen taken, naderende deadlines
- [ ] **Rapportages** — exporteerbare onboarding-rapporten per medewerker
- [ ] **Integraties** — Slack-notificaties, HRIS-koppelingen (Personio, BambooHR)
- [ ] **Meertaligheid** — Engels naast Nederlands

---

## Commit History (recent)

| Commit | Beschrijving |
|---|---|
| `a1114bc` | feat: Stripe webhook handler and Company stripe fields |
| `6689de3` | feat: signup flow working end-to-end |
| `4648f03` | feat: privacy policy and terms of service pages |
| `76769f8` | feat: shared nav and footer components, all marketing pages updated |
| `9e3bf81` | feat: marketing pages - homepage, pricing, signup |
| `5193968` | feat: homepage live |
| `3ce7c71` | feat: navigation component, remove duplicate headers |
