# ONVANTA MASTERPLAN v7
> Gegenereerd: 2026-04-06 · Branch: main · Volledig contextdocument voor nieuwe sessies

---

## 1. PROJECT OVERZICHT

**Onvanta** is een SaaS-platform voor gestructureerde medewerker-onboarding. Het combineert:
- Gefaseerde onboarding-programma's (templates met fases, stappen en inhoudsblokken)
- Spaced-repetition flashcards (ANKI-stijl, ingebouwd in onboarding)
- Manager-zichtbaarheid & goedkeuringen
- At-risk detectie + automatische manager-notificaties
- Multi-tenant met bedrijfsspecifieke huisstijl op e-mails
- Metered billing via Stripe (€24,99/actieve onboardee/maand)

**Doelmarkt:** Nederlandse MKB-bedrijven, initieel gericht op logistiek/transport en print/promotie sector.

**Live URL:** https://onvanta.io  
**Dashboard:** https://supabase.com (project: trktcwtzyaphgjbmkrzd)

---

## 2. TECH STACK

| Laag | Technologie | Versie |
|------|-------------|--------|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | React | 19.2.4 |
| Taal | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Database | PostgreSQL via Supabase | — |
| ORM | Prisma | 7.6.0 |
| DB Client (server) | @supabase/supabase-js (admin) | ^2.100.1 |
| Auth | JWT (jose) + Magic Links | — |
| Email | Resend | ^6.9.4 |
| Payments | Stripe (metered billing) | ^21.0.1 |
| AI | Anthropic Claude API | ^0.82.0 |
| File Storage | Supabase Storage | — |
| Hosting | Vercel | — |
| Cron | Vercel Cron Jobs | — |

**Geen NextAuth session** — eigen JWT sessiesysteem via `src/lib/session.ts` (cookie: `token`, 30 dagen).

---

## 3. DATABASE SCHEMA

### Enums

```prisma
UserRole:       super_admin | company_admin | manager | employee
PlanType:       starter | pro | enterprise
CompanyStatus:  trial | active | paused | cancelled
InstanceStatus: scheduled | active | at_risk | completed | paused | cancelled
TaskStatus:     to_do | in_progress | awaiting_approval | done | overdue | skipped
BlockType:      video | text | document | task | flashcards | questionnaire |
                meeting | acknowledgement | manager_approval
ReviewResult:   good | doubt | fail
```

### Tabellen

#### Company
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| name | String | Bedrijfsnaam |
| slug | String (unique) | URL-vriendelijk, bijv. `acme-bv` |
| logoUrl | String? | Supabase Storage URL (bucket: logos) |
| senderName | String? | E-mail afzendernaam, bijv. "Team Acme B.V." |
| welcomeMessage | String? | Persoonlijk welkomstbericht in mails (max 500 tekens) |
| brandColor | String? | Hex kleur voor e-mail CTA-knop, bijv. `#2563eb` |
| plan | PlanType | default: starter |
| status | CompanyStatus | default: trial |
| trialEndsAt | DateTime? | 14 dagen na signup |
| stripeCustomerId | String? | Stripe customer ID |
| stripeSubscriptionId | String? | Stripe subscription ID |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

#### User
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| email | String (unique) | |
| name | String | |
| avatarUrl | String? | |
| role | UserRole | default: employee |
| companyId | String | FK → Company |
| createdAt/updatedAt | DateTime | auto |

#### Template
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| name | String | |
| description | String? | |
| companyId | String | FK → Company (eigenaar) |
| published | Boolean | default: false |
| isGlobal | Boolean | default: false — true = zichtbaar in bibliotheek voor alle bedrijven |
| createdAt/updatedAt | DateTime | auto |

#### TemplatePhase
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| templateId | String | FK → Template |
| title | String | bijv. "Fase 1: Preboarding" |
| order | Int | volgorde binnen template |
| createdAt | DateTime | auto |

#### TemplateStep
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| phaseId | String | FK → TemplatePhase |
| title | String | |
| description | String? | |
| order | Int | volgorde binnen fase |
| createdAt | DateTime | auto |

#### StepBlock
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| stepId | String | FK → TemplateStep |
| type | BlockType | inhoudstype |
| title | String | |
| required | Boolean | default: true |
| order | Int | volgorde binnen stap |
| config | Json? | type-specifieke data (zie Block Config hieronder) |
| createdAt | DateTime | auto |

**Block Config per type:**
- `text`: `{ body: string }`
- `task`: `{ body: string, dueAfterDays?: number }`
- `acknowledgement`: `{ statement: string }`
- `flashcards`: `{ cards: [{question, answer}] }`
- `questionnaire`: `{ questions: [{question, options: string[], correct: number}] }`
- `manager_approval`: `{ description?: string }`
- `video`: `{ url: string }`
- `document`: `{ url: string, filename?: string }`

#### OnboardingInstance
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| templateId | String | FK → Template |
| employeeId | String | FK → User |
| managerId | String? | FK → User (manager) |
| companyId | String | FK → Company |
| status | InstanceStatus | default: active |
| startDate | DateTime | default: now() |
| endDate | DateTime? | bij completion |
| progressPct | Int | 0–100, berekend bij step completion |
| atRiskNotifiedAt | DateTime? | laatste at-risk notificatie (cooldown 7 dagen) |
| createdAt/updatedAt | DateTime | auto |

#### StepProgress
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| instanceId | String | FK → OnboardingInstance |
| stepId | String | FK → TemplateStep |
| completed | Boolean | default: false |
| completedAt | DateTime? | |
| createdAt | DateTime | auto |
| **@@unique** | [instanceId, stepId] | voorkomt dubbele records bij upsert |

#### Task
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| instanceId | String | FK → OnboardingInstance |
| userId | String | FK → User |
| title | String | |
| status | TaskStatus | default: to_do |
| dueDate | DateTime? | |
| doneAt | DateTime? | |
| createdAt/updatedAt | DateTime | auto |

#### FlashcardSet
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| title | String | |
| createdAt | DateTime | auto |

#### Flashcard
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| setId | String | FK → FlashcardSet |
| question | String | |
| answer | String | |
| order | Int | |
| createdAt | DateTime | auto |

#### FlashcardReview
| Kolom | Type | Notities |
|-------|------|----------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| setId | String | FK → FlashcardSet |
| instanceId | String? | FK → OnboardingInstance |
| result | ReviewResult | good / doubt / fail |
| nextReview | DateTime | volgende beurt (spaced repetition) |
| interval | Int | default: 1 (dagen) |
| createdAt | DateTime | auto |

> **Belangrijk:** Prisma migrate hangt op de pooler-verbinding. DDL-wijzigingen altijd uitvoeren via `postgres.js` met `DIRECT_URL` (zie `.env`). Daarna Prisma schema handmatig bijwerken.

---

## 4. OMGEVINGSVARIABELEN

Sla op in `.env.local` (lokaal) en Vercel dashboard (productie):

| Naam | Gebruik |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publieke sleutel (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side, admin toegang) |
| `NEXTAUTH_SECRET` | JWT signing secret (32+ chars) |
| `NEXTAUTH_URL` | App base URL, bijv. `http://localhost:3000` of `https://onvanta.io` |
| `STRIPE_SECRET_KEY` | Stripe geheime sleutel |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publieke sleutel |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_METERED` | Stripe Price ID voor metered billing (€24,99/onboardee) |
| `STRIPE_METER_ID` | Stripe Meter ID (`active_onboardees`) |
| `RESEND_API_KEY` | Resend API sleutel (e-mail verzending) |
| `ANTHROPIC_API_KEY` | Claude API sleutel (template generatie) |
| `CRON_SECRET` | Bearer token voor Vercel Cron authenticatie |
| `DATABASE_URL` | PostgreSQL pooler URL (voor Prisma, met pgbouncer=true) |
| `DIRECT_URL` | PostgreSQL directe URL (voor DDL via postgres.js) |

> `DATABASE_URL` en `DIRECT_URL` staan alleen in `.env` (niet in `.env.local`).

---

## 5. ALLE API ROUTES

### Authenticatie

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/auth/magic-link` | POST | Publiek | Stuur magic link e-mail (15 min geldig) |
| `/api/auth/verify` | GET | Publiek (token) | Verifieer magic link, maak JWT sessie aan, redirect op rol |
| `/api/auth/logout` | POST | Auth | Verwijder sessie + impersonation cookies |
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler (Google OAuth, niet actief gebruikt) |

### Huidig gebruiker (me)

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/me/profile` | GET | Auth | id, email, role, companyId, name |
| `/api/me/dashboard` | GET | employee/manager | Dashboard data: voortgang, today-taken (max 5), flashcard-steps (max 3) |
| `/api/me/onboarding` | GET | Auth | Volledige onboarding: fases + stappen + voortgang + fase-unlock logica |
| `/api/me/onboarding/[stepId]` | GET | Auth | Stap detail met blokken |
| `/api/me/onboarding/[stepId]` | POST | Auth | Markeer stap als voltooid (upsert StepProgress, herbereken progressPct) |
| `/api/me/tasks` | GET | Auth | Taken voor actieve onboarding (done/overdue/today/upcoming) |
| `/api/me/flashcards` | GET | Auth | Alle flashcards uit actieve onboarding template |
| `/api/me/impersonation` | GET | Auth | Controleer of er een impersonation-sessie actief is |

### Admin — Bedrijf & Gebruikers

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/admin/company` | GET | company_admin/super | Bedrijfsgegevens incl. branding-velden |
| `/api/admin/company` | PATCH | company_admin/super | Update: name, senderName, welcomeMessage, brandColor, logoUrl |
| `/api/admin/company/logo` | POST | company_admin/super | Upload logo naar Supabase Storage (logos bucket), max 2MB, JPG/PNG/WebP/SVG |
| `/api/admin/users` | GET | Auth | Lijst gebruikers; `?managers=1` filtert op manager/admin |
| `/api/admin/users` | POST | company_admin/manager | Gebruiker uitnodigen: maak aan of update, stuur branded magic link e-mail (7 dagen) |

### Admin — Onboardings

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/admin/onboardings` | POST | company_admin/manager/super | Maak OnboardingInstance aan, stuur branded welkomstmail aan medewerker |

### Admin — Templates

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/admin/templates` | GET | company_admin/manager/super | Lijst bedrijfsspecifieke templates (niet-globaal) |
| `/api/admin/templates` | POST | company_admin/manager/super | Nieuw leeg template aanmaken |
| `/api/admin/templates/library` | GET | company_admin/manager/super | Alle globale templates (voor bibliotheek-pagina) |
| `/api/admin/templates/generate` | POST | company_admin/manager/super | AI-generatie via Claude (claude-opus-4-6), 2-pass JSON structuur + blokken |
| `/api/admin/templates/[id]` | GET | company_admin/manager/super | Template + volledige structuur (fases/stappen) |
| `/api/admin/templates/[id]` | PATCH/DELETE | company_admin/super | Update/verwijder template |
| `/api/admin/templates/[id]/clone` | POST | company_admin/manager/super | Deep-clone globaal template naar bedrijf (isGlobal: false) |
| `/api/admin/phases/[phaseId]/order` | POST | company_admin/super | Fase volgorde bijwerken |
| `/api/admin/phases/[phaseId]/steps` | GET/POST | company_admin/super | Stappen in fase ophalen/aanmaken |
| `/api/admin/steps/[stepId]/order` | POST | company_admin/super | Stap volgorde bijwerken |
| `/api/admin/steps/[stepId]/blocks` | GET/POST/PATCH/DELETE | company_admin/super | Blokken beheren in stap |

### Manager

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/manager/team` | GET | manager | Team overzicht: voortgang, at-risk detectie, overschrijden taken |
| `/api/manager/team/[instanceId]` | GET | manager | Detailweergave enkele onboarding |
| `/api/manager/approvals` | GET | manager | Openstaande goedkeuringen |
| `/api/manager/approvals/[instanceId]` | POST | manager | Keur stap goed of af |

### Super Admin

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/super/companies` | GET | super_admin | Alle bedrijven met geaggregeerde counts |
| `/api/super/companies/[companyId]` | GET | super_admin | Bedrijfsdetail: gebruikers, templates, onboardings |
| `/api/super/companies/[companyId]/stats` | GET | super_admin | Statistieken voor bedrijf |
| `/api/super/companies/[companyId]/audit` | GET | super_admin | Audit log voor bedrijf |
| `/api/super/companies/[companyId]/flags` | GET/POST | super_admin | Feature flags per bedrijf |
| `/api/super/templates` | GET | super_admin | Alle templates (globaal + bedrijfsspecifiek) met fase/stap counts |
| `/api/super/templates` | POST | super_admin | Nieuw globaal template aanmaken |
| `/api/super/templates/[id]` | PATCH | super_admin | Toggle isGlobal |
| `/api/super/impersonate` | POST | super_admin | Impersoneer gebruiker (4 uur geldig JWT) |
| `/api/super/impersonate` | DELETE | super_admin | Stop impersonatie |

### Billing

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/billing/checkout` | POST | company_admin/super | Start Stripe checkout sessie (metered, 14-daagse trial) |
| `/api/billing/portal` | POST | company_admin/super | Open Stripe klantportaal |
| `/api/billing/report-usage` | POST/GET | CRON_SECRET | Rapporteer actieve onboardees aan Stripe (alleen op 1e van de maand) |
| `/api/webhooks/stripe` | POST | Stripe signature | Verwerk Stripe events: subscription updates → Company status/plan |

### Notificaties & Overig

| Route | Methode | Auth | Beschrijving |
|-------|---------|------|--------------|
| `/api/notifications/at-risk` | POST/GET | CRON_SECRET | Detecteer at-risk onboardings, stuur manager-mails (cooldown 7 dagen) |
| `/api/signup` | POST | Publiek | Registreer nieuw bedrijf: Company + User + Stripe customer + magic link |
| `/api/contact` | POST | Publiek | Verstuur contactformulier via Resend |

---

## 6. ALLE PAGINA'S

### Marketing (publiek)

| Route | Beschrijving |
|-------|--------------|
| `/` | Homepage: hero, features, testimonials, pricing CTA |
| `/pricing` | Pricing: €24,99/onboardee + voorbeeldtabel + features |
| `/about` | Over Onvanta |
| `/contact` | Contactformulier |
| `/terms` | Algemene voorwaarden |
| `/privacy` | Privacybeleid |
| `/signup` | Bedrijfsregistratie: 2-staps formulier (bedrijf → admin account) |
| `/login` | Magic link aanvragen |

### Medewerker (rol: employee)

| Route | Beschrijving |
|-------|--------------|
| `/dashboard` | Overzicht: voortgang, taken van vandaag, flashcards widget |
| `/onboarding` | Fase/stap navigator: sequentieel, voortgangsbalk per fase |
| `/onboarding/[stepId]` | Stap detail: alle blokken, "Volgende stap" knop, saveError handling |
| `/tasks` | Takenlijst gesorteerd op status (vandaag/achterstallig/aankomend/klaar) |
| `/flashcards` | ANKI-stijl kaartenherhaling: goed/twijfel/fout knoppen, spaced repetition |

### Admin (rol: company_admin)

| Route | Beschrijving |
|-------|--------------|
| `/admin` | Bedrijfsdashboard: statistieken, recente onboardings |
| `/admin/users` | Gebruikersbeheer: uitnodigen, rollen toewijzen |
| `/admin/onboardings/new` | Nieuwe onboarding starten: medewerker + template + manager + startdatum |
| `/admin/templates` | Templateoverzicht: mijn templates (+ zoekbalk) + doorlink bibliotheek |
| `/admin/templates/library` | Globale templatebibliotheek met zoekfunctie + "Gebruik als startpunt" kloonknop |
| `/admin/templates/[id]` | Template preview (niet-bewerkbaar) |
| `/admin/templates/[id]/edit` | Template builder: fases, stappen, blokken toevoegen/herordenen/verwijderen |
| `/admin/templates/[id]/edit/[stepId]` | Blok-editor voor één stap |
| `/admin/settings` | Instellingen met 3 tabs: Algemeen · Huisstijl · Abonnement |

### Manager (rol: manager)

| Route | Beschrijving |
|-------|--------------|
| `/manager` | Teamoverzicht: voortgang per medewerker, at-risk badges, status |
| `/manager/[id]` | Onboarding detail: fases, stappen, taken, at-risk info |
| `/manager/approvals` | Openstaande goedkeuringsverzoeken |

### Super Admin (rol: super_admin)

| Route | Beschrijving |
|-------|--------------|
| `/super` | Platformoverzicht: alle bedrijven, statistieken, globale templates beheren |
| `/super/[companyId]` | Bedrijfsdetailpagina: gebruikers, templates, onboardings, audit log |

---

## 7. COMPONENTEN

| Component | Locatie | Beschrijving |
|-----------|---------|--------------|
| `Navigation` | `src/components/navigation.tsx` | Sidebar + mobiele nav; rol-gebaseerd menu; actieve route detectie |
| `MarketingNav` | `src/components/marketing-nav.tsx` | Publieke site header |
| `MarketingFooter` | `src/components/marketing-footer.tsx` | Publieke site footer |
| `ImpersonationBanner` | `src/components/impersonation-banner.tsx` | Gele banner wanneer super-admin impersonatie actief is |
| `CookieBanner` | `src/components/cookie-banner.tsx` | GDPR cookie-toestemmingsbanner |

---

## 8. LIB BESTANDEN

| Bestand | Beschrijving |
|---------|--------------|
| `src/lib/session.ts` | JWT sessie lezen/schrijven; cookie: `token`; 30 dagen geldig; retourneert `{id, email, role, companyId}` |
| `src/lib/supabase.ts` | `supabase` (anon, client-side) + `supabaseAdmin` (service role, server-side) |
| `src/lib/stripe.ts` | Stripe client, PRICE_METERED, METER_ID exports |
| `src/lib/auth.ts` | NextAuth configuratie (Google OAuth) — niet actief gebruikt |
| `src/lib/audit.ts` | `logAudit(action, userId, companyId, meta)` — non-blocking, nooit throwend |
| `src/lib/email-branding.ts` | HTML e-mail bouwers: `buildEmailHeader`, `buildWelcomeBlock`, `buildCtaButton`, `resolveColor`, `resolveSender` |

---

## 9. SCRIPTS

| Script | Uitvoeren | Beschrijving |
|--------|-----------|--------------|
| `scripts/seed.ts` | `npx dotenv-cli -e .env.local -- npx tsx scripts/seed.ts` | 3 handmatige templates voor onvanta-test (Customer Service, Sales, Operator) |
| `scripts/seed-templates.ts` | `npx dotenv-cli -e .env.local -- npx tsx scripts/seed-templates.ts` | 20 globale templates via Claude API (print/promo sector), twee-pass strategie |
| `scripts/seed-logistics-templates.ts` | `npx dotenv-cli -e .env.local -- npx tsx scripts/seed-logistics-templates.ts` | 10 globale templates via Claude API (logistiek sector), twee-pass + jsonrepair |

**Twee-pass strategie** voor AI-seed scripts:
1. **Pass 1:** Claude genereert template structuur (fases + stap titels)
2. **Pass 2:** Claude genereert blokken per fase (apart, voorkomt truncatie)

Gebruikt `claude-haiku-4-5-20251001`, `max_tokens: 16000`, `jsonrepair` voor malformed JSON.  
Skip-logica: als template naam al bestaat → overgeslagen.

---

## 10. STRIPE SETUP (METERED BILLING)

### Model
- **Prijs:** €24,99 per actieve onboardee per maand
- **Billing:** Achteraf (usage-based), metered via Stripe Billing Meters
- **Trial:** 14 dagen gratis bij signup
- **Managers/admins:** tellen nooit mee

### Configuratie
- `STRIPE_PRICE_METERED` → Stripe Price ID (metered)
- `STRIPE_METER_ID` → Stripe Meter ID (`active_onboardees` event)
- Stripe Webhook: `STRIPE_WEBHOOK_SECRET`

### Flows

**Activering:**
1. Admin klikt "Activeer abonnement" op `/admin/settings`
2. `POST /api/billing/checkout` → Stripe Checkout sessie
3. Na betaling: Stripe webhook → `POST /api/webhooks/stripe`
4. Webhook update Company.status → `active`, slaat stripeSubscriptionId op

**Maandelijkse rapportage (Cron):**
- Vercel Cron `0 6 * * *` roept `POST /api/billing/report-usage` aan
- Route checkt: `today.getUTCDate() !== 1` → skip
- Telt actieve OnboardingInstances per bedrijf
- Rapporteert via `stripe.billing.meterEvents.create({ event_name: 'active_onboardees' })`

**Webhook events afgehandeld:**
- `customer.subscription.updated`
- `customer.subscription.deleted`
- → Update Company.status (active/paused/cancelled) en plan

---

## 11. TEMPLATE BIBLIOTHEEK

### Status: 30 globale templates in productie

#### Print & Promotie (20 templates — seed-templates.ts)
| # | Naam |
|---|------|
| 1 | Account Manager Promo |
| 2 | Bindery Afwerking Medewerker |
| 3 | Binnendienst Medewerker Promo |
| 4 | Customer Service Medewerker POD |
| 5 | Drukkerij Operator Offsetdruk |
| 6 | Inkoper Leveranciersbeheer POD |
| 7 | Installateur Reclame-uitingen |
| 8 | Klantenservice Drukkerij |
| 9 | Klantenservice Grootformaat |
| 10 | Klantenservice Textiel en Borduur |
| 11 | Operator Grootformaat Print |
| 12 | Operator POD |
| 13 | Operator Textieldruk |
| 14 | Prepress Medewerker |
| 15 | Productie Planner POD |
| 16 | Projectcoördinator Promo Events |
| 17 | Sales Medewerker Drukkerij |
| 18 | Sales Medewerker POD |
| 19 | Sales Textiel en Workwear |
| 20 | Sourcing Specialist Promo |

#### Logistiek & Transport (10 templates — seed-logistics-templates.ts)
| # | Naam |
|---|------|
| 21 | Chauffeur Distributie (rijbewijs B) |
| 22 | Chauffeur Internationaal Transport (rijbewijs CE) |
| 23 | Douane & Compliance Medewerker |
| 24 | Expediteur |
| 25 | Heftruckchauffeur |
| 26 | Logistiek Planner |
| 27 | Magazijnmedewerker |
| 28 | Medewerker Klantenservice Logistiek |
| 29 | Retourverwerking Medewerker |
| 30 | Teamleider Magazijn |

### Template Structuur
- Elke template: **4 fases** (Preboarding → Week 1 → Vakkennis → Evaluatie)
- Elke fase: **3–4 stappen**
- Elke stap: **mix van blokken** (tekst, flashcards, quiz, taken, goedkeuring)
- Gemiddeld: ~14–16 stappen, ~55–70 blokken per template

### Globale templates beheren
- Super admin: `/super` → Templates bibliotheek tab → toggle "Globaal" aan/uit
- Bedrijven: `/admin/templates/library` → "Gebruik als startpunt" → deep clone naar eigen account

---

## 12. E-MAIL HUISSTIJL SYSTEEM

### Bedrijfsinstellingen (tab "Huisstijl" op `/admin/settings`)
- **Logo:** upload naar Supabase Storage (`logos/{companyId}/logo.{ext}`), publieke URL met cache-buster
- **Afzendernaam:** verschijnt als "Van:" naam in inbox (fallback: "Onvanta")
- **Welkomsttekst:** geciteerd blok onderaan e-mail (max 500 tekens)
- **Primaire kleur:** hex, gebruikt voor header achtergrond + CTA-knop (fallback: `#2563eb`)
- **Live preview** in instellingen-pagina

### Gebrandmerkte mails
Twee routes passen huisstijl toe:
1. `POST /api/admin/users` → gebruiker uitnodigen
2. `POST /api/admin/onboardings` → onboarding starten

Beide halen Company branding op en gebruiken `src/lib/email-branding.ts`.

### Fallback gedrag (geen huisstijl)
- Geen logo → tekst-header met afzendernaam
- Geen kleur → Onvanta blauw (`#2563eb`)
- Geen afzendernaam → "Onvanta"
- Geen welkomsttekst → welkomstblok weggelaten

---

## 13. AUTHENTICATIE & SESSIES

### Magic Link Flow
1. Gebruiker vraagt link aan op `/login` of via uitnodigingse-mail
2. `POST /api/auth/magic-link` → maakt `MagicLinkToken` aan (15 min of 7 dagen)
3. Resend verstuurt e-mail met link
4. `GET /api/auth/verify?token=...` → valideert token, maakt JWT sessie cookie
5. Redirect op rol: `super_admin → /super`, `company_admin → /admin`, `manager → /manager`, `employee → /dashboard`

### JWT Sessie
- Cookie naam: `token`
- Geldig: 30 dagen
- Payload: `{ sub, email, role, companyId }`
- Signing: HMAC-SHA256 met `NEXTAUTH_SECRET`
- Server-side lezen: `getSession()` uit `src/lib/session.ts`

### Impersonatie (Super Admin)
- `POST /api/super/impersonate` → korte JWT (4 uur) + cookie `impersonation_token`
- `ImpersonationBanner` component toont gele melding
- `DELETE /api/super/impersonate` → verwijder impersonation cookie

---

## 14. AT-RISK SYSTEEM

### Drempelwaarden
- `AT_RISK_DAYS_INACTIVE = 3` — geen stap voltooid in 3+ dagen
- `AT_RISK_OVERDUE_COUNT = 3` — 3+ taken zijn overdue
- `NOTIFY_COOLDOWN_DAYS = 7` — minimaal 7 dagen tussen notificaties

### Detectie
- Cron `0 8 * * *` → `GET /api/notifications/at-risk`
- Per actieve/at-risk instance: check laatste StepProgress.completedAt + overdue task count
- Als at-risk: update OnboardingInstance.status = `at_risk`, sla `atRiskNotifiedAt` op
- Stuur HTML e-mail naar manager via Resend (met reden + link naar detail)

### Manager UI
- `GET /api/manager/team` herberekent at-risk status realtime bij elk ophalen
- Badge "At risk" zichtbaar in manager dashboard

---

## 15. CRON JOBS

| Path | Schedule | Beschrijving |
|------|----------|--------------|
| `/api/billing/report-usage` | `0 6 * * *` (6:00 UTC dagelijks) | Rapporteer actieve onboardees aan Stripe; voert alleen actie uit op 1e van de maand |
| `/api/notifications/at-risk` | `0 8 * * *` (8:00 UTC dagelijks) | Detecteer at-risk onboardings, stuur manager-notificaties |

**Authenticatie:** `Authorization: Bearer {CRON_SECRET}` header, vereist in productie.

---

## 16. VERCEL CONFIGURATIE

```json
{
  "crons": [
    { "path": "/api/billing/report-usage", "schedule": "0 6 * * *" },
    { "path": "/api/notifications/at-risk",  "schedule": "0 8 * * *" }
  ]
}
```

**Let op Vercel Hobby plan:** max 2 cron jobs, dagelijkse frequentie — intern beperkt tot 1e van de maand voor billing.

---

## 17. BEKENDE BUGS & QUIRKS (OPGELOST)

| Bug | Oorzaak | Oplossing |
|-----|---------|-----------|
| "Activeer abonnement" doet niets | Checkout-fouten werden stil geslikt | Error state + PRICE_METERED guard toegevoegd |
| Fase 2 ontgrendelt niet na voltooiing fase 1 | `allDone = steps.length > 0 && every(...)` — lege fase = altijd false | Gewijzigd naar `steps.length === 0 || every(...)` |
| "Kon voortgang niet opslaan" (Lotte Zuidema) | Ontbrekende `UNIQUE(instanceId, stepId)` constraint op StepProgress | Constraint toegevoegd via direct SQL |
| Prisma migrate hangt | Supabase pooler URL ondersteunt geen DDL | Gebruik altijd `DIRECT_URL` + postgres.js voor schema-wijzigingen |
| Seed script JSON parse errors (logistiek) | Claude genereerde onafgesloten strings / unescaped quotes | `jsonrepair` npm library + max_tokens 16000 + expliciete prompt-instructie |
| Browser tab title "Create Next App" | Ontbrekende metadata in layout.tsx | Volledige metadata + OpenGraph + Twitter card toegevoegd |

---

## 18. OPENSTAANDE PUNTEN & VERBETERPUNTEN

### Functionele gaps
- **Google OAuth** geconfigureerd in NextAuth maar niet actief gebruikt of getest
- **"Account pauzeren/verwijderen"** knoppen in Gevarenzone zijn UI-only (geen implementatie)
- **FlashcardSet/Flashcard** tabellen bestaan maar zijn losgekoppeld van StepBlock-flashcards; flashcards worden opgeslagen in `StepBlock.config.cards` (geen aparte FlashcardSet records voor template-flashcards)
- **Stap volgorde herordenen** (drag & drop) — API bestaat, UI-implementatie onbekend
- **Template publish workflow** — `published` veld bestaat maar publicatie-check ontbreekt in sommige routes
- **isGlobal veld op Template** ontbreekt in Prisma schema (staat wel in DB en Supabase) — toegevoegd via raw SQL, Prisma schema NIET bijgewerkt

### UX verbeterpunten
- Geen e-mailbevestiging na het opslaan van huisstijl-instellingen (wel "✓ Opgeslagen")
- Geen bulk-uitnodiging (CSV import)
- Geen herinnerings-e-mail optie voor at-risk medewerkers direct vanuit manager dashboard
- Geen onboarding voortgangs-e-mail update (wekelijkse samenvatting)

### Technische schuld
- Zware debug-logging in `/api/me/onboarding/route.ts` (ID type checks, completedInPhase counts) — kan worden opgeruimd
- `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY` etc. worden verwacht door Stripe webhook maar zijn niet ingesteld (resolvePlan fallback gebruikt)
- `FlashcardSet` en `Flashcard` tabellen worden niet populiert door seed scripts; flashcard data zit in StepBlock.config

---

## 19. ROADMAP & VOLGENDE STAPPEN

### Direct uitvoerbaar
- [ ] `isGlobal` toevoegen aan Prisma schema (staat al in DB, nog niet in schema.prisma)
- [ ] Debug-logging opruimen in `/api/me/onboarding/route.ts`
- [ ] "Account pauzeren/verwijderen" implementeren
- [ ] CSV bulk-import voor medewerkers

### Korte termijn
- [ ] Nieuwe sector templates (zorg, horeca, retail)
- [ ] Wekelijkse voortgangs-digest e-mail voor managers
- [ ] Onboarding completion certificaat (PDF)
- [ ] Medewerker kan zelf stap opnieuw doen / oefenmodus
- [ ] Video blok implementatie (embed YouTube/Vimeo of upload)

### Middellange termijn
- [ ] Analytics dashboard (completion rates, gemiddelde duur, drop-off analyse)
- [ ] Manager kan taken aanmaken buiten template om
- [ ] Notificaties in-app (niet alleen e-mail)
- [ ] Multi-taal ondersteuning (Engels naast Nederlands)
- [ ] API voor externe integraties (HR-systemen, Slack)

### Productie checklist
- [ ] Vercel dashboard: controleer STRIPE_PRICE_METERED, STRIPE_METER_ID, CRON_SECRET
- [ ] Supabase Storage RLS policy voor `logos` bucket (momenteel publiek)
- [ ] Stripe webhook endpoint geregistreerd in Stripe dashboard
- [ ] NEXTAUTH_URL instellen op `https://onvanta.io` in Vercel

---

## 20. LOKALE ONTWIKKELING

```bash
# Installeer dependencies
npm install

# Start dev server
npm run dev

# Database schema wijziging (NOOIT prisma migrate gebruiken)
node -e "
const postgres = require('postgres')
const sql = postgres(process.env.DIRECT_URL || require('fs').readFileSync('.env','utf8').match(/DIRECT_URL=\"([^\"]+)\"/)[1])
sql\`ALTER TABLE ...\`.then(() => { console.log('Done'); process.exit(0) }).catch(e => { console.error(e.message); process.exit(1) })
"

# Seed templates (vereist ANTHROPIC_API_KEY)
npx dotenv-cli -e .env.local -- npx tsx scripts/seed-logistics-templates.ts

# TypeScript check
npx tsc --noEmit
```

---

## 21. GIT HISTORIEK (RECENTE COMMITS)

```
a4a9d71 feat: gepersonaliseerde uitnodigingsmails per bedrijf (huisstijl)
154b51c fix: use jsonrepair for robust JSON parsing in logistics seed script
[eerder] feat: 10 logistiek & transport globale templates (seed script)
[eerder] feat: manager at-risk e-mail notificaties via Resend
[eerder] feat: zoekfunctie op template bibliotheek pagina's
[eerder] fix: fase progressie bug (lege fase blokkeerde volgende fase)
[eerder] fix: StepProgress unique constraint, voortgang opslaan
[eerder] feat: SEO metadata, Open Graph, browser tab titel
[eerder] feat: metered billing €24,99/onboardee, Stripe checkout
[eerder] feat: privacy policy en algemene voorwaarden pagina's
[eerder] feat: marketing pagina's, navigatie, footer
```

---

*Dit document is automatisch gegenereerd op basis van de volledige broncode per 2026-04-06.*  
*Bijwerken: commit dit bestand na elke significante feature of architectuurwijziging.*
