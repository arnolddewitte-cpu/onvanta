/**
 * Seed script: genereert 10 logistiek & transport onboarding templates via de Anthropic API
 * en slaat ze op als globale templates in Supabase.
 *
 * Uitvoeren: npx dotenv-cli -e .env.local -- npx tsx scripts/seed-logistics-templates.ts
 *
 * Strategie: twee API-calls per template
 *   Pass 1: structuur (fases + stap titels)
 *   Pass 2: blokken per fase (apart, voorkomt truncatie)
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COMPANY_SLUG = 'onvanta-test'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType = 'text' | 'task' | 'acknowledgement' | 'flashcards' | 'questionnaire' | 'manager_approval'

interface Block {
  type: BlockType
  title: string
  body?: string
  description?: string
  statement?: string
  cards?: { question: string; answer: string }[]
  questions?: { question: string; options: string[]; correct: number }[]
}

interface StepStructure { title: string; description: string }
interface PhaseStructure { title: string; steps: StepStructure[] }
interface TemplateStructure { name: string; description: string; phases: PhaseStructure[] }

interface StepFull { title: string; description: string; blocks: Block[] }
interface PhaseFull { title: string; steps: StepFull[] }
interface TemplateFull { name: string; description: string; phases: PhaseFull[] }

// ─── Template definities ──────────────────────────────────────────────────────

const TEMPLATES_TO_GENERATE = [
  {
    name: 'Magazijnmedewerker',
    context: 'Medewerker in een distributie- of productiemagazijn. Voert orderpickingactiviteiten uit met RF-scanner, handpallettruck en elektrische pallettruck (rijbewijs intern). Werkt met WMS (Warehouse Management Systeem) voor orderpicking, inslag en uitslag. Kent FIFO/FEFO-principes, magazijnindeling (rack, blok, vloer), gevaarlijke stoffen opslag (VCA, ADR-opslag), ergonomisch tillen (max. 23 kg richtlijn), arbeidshygiëne en BHV-procedures. Verwerkt retouren en voert voorraadtelling uit.'
  },
  {
    name: 'Heftruckchauffeur',
    context: 'Gecertificeerd heftruckchauffeur in een logistiek of productieomgeving. Bestuurt contra-gewichtheftruck (diesel/gas/elektrisch), reachtrucktruc en eventueel orderpicker. Bezit geldig VCA en intern heftruckcertificaat (BMWT/Sertifiq of vergelijkbaar). Kent stabiliteitsprincipes (heftruckcapaciteitsplaat, lastdiagram, zwaartepunt), veilige rijsnelheden, vorkpositie bij transport en rijden met lading. Voert dagelijkse preinspectie uit (banden, hydrauliek, vork, verlichting, vloeistofniveaus), rapporteert defecten. Kent ATEX-zones, brandblusprocedures en evacuatieplan.'
  },
  {
    name: 'Chauffeur Distributie (rijbewijs B)',
    context: 'Stadsbestellingschauffeur of distributiechauffeur rijbewijs B in de last-mile logistiek. Rijdt dagelijks een vaste of dynamische route met bestelbus (max. 3.500 kg). Kent routeplanning (TomTom Telematics, Fleetboard of vergelijkbaar), rijtijdenwetgeving rijbewijs B (geen tachograafplicht), laadnormen bestelbus (vlakke lading, sjorring), parkeerprocedures in stedelijke gebieden, klantgericht afleveren (handtekening, AVG), retourstromen. Voert dagelijkse APK-check uit (CROW-checklist). Kent basiskennis ADR (drempel voor kleine hoeveelheden) en veiligheidsblad (SDS).'
  },
  {
    name: 'Chauffeur Internationaal Transport (rijbewijs CE)',
    context: 'Langeafstandschauffeur rijbewijs CE + code 95. Rijdt internationaal transport met oplegger (curtainsider, koeloplegger, coilmulde). Beheerst digitale tachograaf (inslagprocedures, downloadinterval 28 dagen, rij- en rusttijden Verordening EG 561/2006), CMR-vrachtbrief (10 verplichte vermeldingen, aansprakelijkheid RD €8,33/kg), cabotageregels, ADR basiskennis gevaarlijke stoffen (klassen, UN-nummers, oranje bord, schriftelijke instructies). Kent douaneprocedures (T1, TIR, ATA-carnet), tolsystemen (Eurovignette, VIAPASS), weegbrug-naleving, sjorring EN 12195-1 (2/3-1/3 regel) en winterrijden.'
  },
  {
    name: 'Logistiek Planner',
    context: 'Logistiek planner verantwoordelijk voor transportplanning in een distributiebedrijf of verlader. Plant ritten voor een wagenpark, optimaliseert routes (TMS zoals TMSfactor, Transics, Trimble), bewaakt rijden-rusttijden (Verordening EG 561/2006), coördineert chauffeurs en subcontractors. Behandelt spoedorders en ADR-transporten. Kent KPI-rapportage (on-time delivery, kosten per km), capaciteitsmanagement, vrachtbriefdocumentatie (CMR, handelsfactuur, paklijst), douaneformaliteiten en escalatieprocedures bij schades of vertragingen.'
  },
  {
    name: 'Expediteur',
    context: 'Expediteur bij een freight forwarder of logistiek dienstverlener. Organiseert zeevracht (FCL/LCL, bill of lading, HS-codes, Incoterms 2020), luchtvracht (airwaybill, IATA-gevaarlijke stoffen klasse 1–9, tarief per kg of volumegewicht), wegtransport (CMR) en spoor. Verwerkt douanedocumentatie (MRN, T1, EUR.1, oorsprongscertificaat), tolheffingen en accijnsbehandeling. Werkt met CargoWise of vergelijkbaar TMS. Kent aansprakelijkheidslimieten (Hague-Visby, Warschau-Montreal, CMR) en incasso-procedures bij schade.'
  },
  {
    name: 'Teamleider Magazijn',
    context: 'Eerstelijns teamleider in een magazijn met 5–20 medewerkers. Stuurt dagelijks werk aan: inslag, orderpicking, uitslag, retouren en inventarisatie. Werkt met WMS voor werkverdeling en capaciteitsplanning. Bewaakt KPIs: pickaccuracy (target >99,5%), productiviteit (regels/uur), voorraadnauwkeurigheid. Voert functioneringsgesprekken, verzuimgesprekken (protocollen Wet Verbetering Poortwachter) en toolboxmeetings (VGW). Werkt samen met warehouse manager bij capplan en personeelsplanning. Verantwoordelijk voor ARBO-naleving op de werkvloer: BHV, VCA, keuringstermijnen heftruck en ladders.'
  },
  {
    name: 'Medewerker Klantenservice Logistiek',
    context: 'Klantenservice medewerker bij een logistiek dienstverlener of transportbedrijf. Behandelt klantcontact over zendingstatus (track & trace), vertraging, schade, vermissing en retourzendingen. Werkt met TMS/WMS voor statusupdates, legt claims vast (CMR-aansprakelijkheid 8,33 SDR/kg, 30-dagenregel), communiceert proactief over afwijkingen. Kent tolvrije meldkodeprocedures, gevaarlijke stoffen meldingen (ADR), douaneproblemen en escalatiepaden. Werkt in CRM en is verantwoordelijk voor SLA-naleving (reactietijd, oplostijd).'
  },
  {
    name: 'Douane & Compliance Medewerker',
    context: 'Douane- en compliancemedewerker bij een importeur, exporteur of freight forwarder. Verzorgt douaneaangiften (AGS/PLDA, export EX-A, import IM-4/IM-7), controleert HS-codes en tariefclassificatie (GS-nomenclatuur 8-cijferig), toepast preferentieel oorsprongsrecht (EUR.1, REX). Kent sanctiescreening (OFAC, EU-sanctielijsten), dual-use goederen (Vo. 428/2009), AEO-certificering (veiligheids- en vereenvoudigingsvergunning). Beheerst Incoterms 2020 voor prijsafspraken en aansprakelijkheid. Onderhoudt contact met douane, havendiensten en Economische Dienst.'
  },
  {
    name: 'Retourverwerking Medewerker',
    context: 'Medewerker retourverwerking in een e-commerce of distributiecentrum. Verwerkt inkomende retourzendingen: scannen, sorteren, beoordelen kwaliteit (A/B/C-grade), herverwerken of afvoeren. Werkt met WMS en retoursystemen (bijv. ReturnGo, Returnista). Kent consumentenretourrecht (Wet Koop op Afstand, 14-dagentermijn), ADR-afvoerprocedures voor gevaarlijke stoffen (batterijen, chemicaliën), CE-markeringscontrole bij herverkoop en afvalscheiding (NVRD-richtlijnen, e-waste, papier, palletbeheer). Rapporteert retourkwaliteit en fraudesignalen.'
  },
]

// ─── Pass 1: Genereer structuur ───────────────────────────────────────────────

async function generateStructure(name: string, context: string): Promise<TemplateStructure> {
  const prompt = `Je bent een expert in het ontwerpen van onboarding programma's voor medewerkers in de logistiek en transport sector.

Maak de STRUCTUUR van een onboarding template voor: "${name}"
Branche-context: ${context}

VEREISTEN:
- Precies 4 fases: (1) Preboarding & Welkomst, (2) Eerste werkweek: Basis & Veiligheid, (3) Vakkennis & Zelfstandig werken, (4) Volledige inzetbaarheid & Evaluatie
- Elke fase heeft minimaal 3 en maximaal 4 stappen
- Per stap: een duidelijke titel en korte beschrijving (1-2 zinnen)
- Gebruik echte logistieke vakkennis: ADR, CMR, WMS, veiligheidsnormen, rijbewijzen, douane etc.

Geef ALLEEN geldige JSON, geen markdown, geen uitleg:
{
  "name": "${name}",
  "description": "2-3 zinnen over dit onboarding programma",
  "phases": [
    {
      "title": "Fase naam",
      "steps": [
        { "title": "Stap titel", "description": "Korte stap beschrijving" }
      ]
    }
  ]
}`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as { type: string; text: string }).text.trim()
  const json = raw.startsWith('```') ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim() : raw
  return JSON.parse(json) as TemplateStructure
}

// ─── Pass 2: Genereer blokken per fase ───────────────────────────────────────

interface PhaseRequirements {
  flashcards: number
  needsQuiz: boolean
  needsApproval: boolean
}

async function generatePhaseBlocks(
  templateName: string,
  context: string,
  phase: PhaseStructure,
  phaseIndex: number,
  reqs: PhaseRequirements,
  attempt = 1
): Promise<PhaseFull> {
  const stepsJson = phase.steps.map((s, i) => `Stap ${i + 1}: "${s.title}" — ${s.description}`).join('\n')

  const prompt = `Je bent een expert in onboarding voor de logistiek en transport sector.

Template: "${templateName}"
Branche-context: ${context}
Fase ${phaseIndex + 1}: "${phase.title}"

Stappen in deze fase:
${stepsJson}

Maak voor elke stap uitgebreide blokken met ECHTE logistieke vakinhoud.
Gebruik specifieke normen, regelgeving, systemen en procedures uit de logistiek: ADR-klassen, CMR-bepalingen, WMS-workflows, rijbewijsregels, douanecodes, veiligheidsreglementen (VCA, ARBO), rijtijdenwetgeving, sjorringsnormen etc.

VEREISTEN PER STAP:
1. Altijd 1 "text" blok met MINIMAAL 100 woorden echte vakkennis (concrete normen, waarden, procedures, regelgeving)
2. Altijd 1 "task" blok of 1 "acknowledgement" blok
${reqs.flashcards > 0 ? `3. Verspreid ${reqs.flashcards} flashcards over de stappen in deze fase (in 1-2 flashcard blokken, elke flashcard met een echte logistieke vraag en specifiek antwoord met concrete waarden/normen)` : ''}
${reqs.needsQuiz ? `4. Voeg 1 "questionnaire" blok toe met 4 meerkeuzevragen over logistieke regelgeving of vakkennis (4 opties per vraag, 1 correct)` : ''}
${reqs.needsApproval ? `5. Voeg 1 "manager_approval" blok toe met concrete, toetsbare beoordelingscriteria voor de praktijk` : ''}

Geef ALLEEN geldige JSON, geen markdown, geen uitleg:
{
  "title": "${phase.title}",
  "steps": [
    {
      "title": "Exacte stap titel",
      "description": "Stap beschrijving",
      "blocks": [
        {
          "type": "text",
          "title": "Blok titel",
          "body": "Minimaal 100 woorden vakinhoud..."
        },
        {
          "type": "task",
          "title": "Taaknaam",
          "description": "Concrete taakbeschrijving"
        },
        {
          "type": "flashcards",
          "title": "Flashcards: onderwerp",
          "cards": [{"question": "Vraag?", "answer": "Specifiek antwoord met concrete waarden"}]
        },
        {
          "type": "questionnaire",
          "title": "Kennistoets: onderwerp",
          "questions": [{"question": "Vraag?", "options": ["A", "B", "C", "D"], "correct": 0}]
        },
        {
          "type": "acknowledgement",
          "title": "Bevestiging: onderwerp",
          "statement": "Ik bevestig dat ik ... volledig begrijp en zal naleven."
        },
        {
          "type": "manager_approval",
          "title": "Goedkeuring: mijlpaal",
          "description": "Concrete criteria voor de manager om te beoordelen"
        }
      ]
    }
  ]
}`

  process.stdout.write(`    Fase ${phaseIndex + 1} "${phase.title}"${attempt > 1 ? ` (poging ${attempt})` : ''}...`)

  const maxTokens = phaseIndex === 2 ? 12000 : 8000

  let msg
  try {
    msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && (err.message.includes('timed out') || err.message.includes('timeout'))
    if (isTimeout && attempt < 3) {
      console.log(` ⟳ timeout, 5s wachten...`)
      await new Promise(r => setTimeout(r, 5000))
      return generatePhaseBlocks(templateName, context, phase, phaseIndex, reqs, attempt + 1)
    }
    throw err
  }

  const raw = (msg.content[0] as { type: string; text: string }).text.trim()
  const json = raw.startsWith('```') ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim() : raw
  const result = JSON.parse(json) as PhaseFull

  let flashcards = 0, quiz = 0, approval = 0
  for (const s of result.steps) {
    for (const b of s.blocks) {
      if (b.type === 'flashcards') flashcards += b.cards?.length ?? 0
      if (b.type === 'questionnaire') quiz++
      if (b.type === 'manager_approval') approval++
    }
  }
  console.log(` ✓ (${result.steps.length} stappen, ${flashcards} flashcards, ${quiz} quiz, ${approval} approval)`)
  return result
}

// ─── Supabase insert ──────────────────────────────────────────────────────────

function blockToConfig(block: Block): Record<string, unknown> {
  switch (block.type) {
    case 'text':             return { body: block.body ?? '' }
    case 'task':             return { description: block.description ?? '' }
    case 'acknowledgement':  return { statement: block.statement ?? '' }
    case 'flashcards':       return { cards: block.cards ?? [] }
    case 'questionnaire':    return { questions: block.questions ?? [] }
    case 'manager_approval': return { description: block.description ?? '' }
    default:                 return {}
  }
}

const REQUIRED_BLOCKS: BlockType[] = ['task', 'acknowledgement', 'manager_approval']

async function insertTemplate(companyId: string, tmpl: TemplateFull): Promise<string> {
  const { data: existing } = await supabase
    .from('Template')
    .select('id')
    .eq('name', tmpl.name)
    .eq('companyId', companyId)
    .maybeSingle()

  if (existing) {
    console.log(`  ⚠️  Overgeslagen – "${tmpl.name}" bestaat al (${existing.id})`)
    return existing.id
  }

  const { data: template, error: tmplErr } = await supabase
    .from('Template')
    .insert({ name: tmpl.name, description: tmpl.description, companyId, published: true, isGlobal: true })
    .select('id').single()
  if (tmplErr || !template) throw new Error(`Template insert: ${tmplErr?.message}`)

  for (let pi = 0; pi < tmpl.phases.length; pi++) {
    const phase = tmpl.phases[pi]
    const { data: phaseRow, error: phaseErr } = await supabase
      .from('TemplatePhase')
      .insert({ templateId: template.id, title: phase.title, order: pi })
      .select('id').single()
    if (phaseErr || !phaseRow) throw new Error(`Fase insert: ${phaseErr?.message}`)

    for (let si = 0; si < phase.steps.length; si++) {
      const step = phase.steps[si]
      const { data: stepRow, error: stepErr } = await supabase
        .from('TemplateStep')
        .insert({ phaseId: phaseRow.id, title: step.title, description: step.description ?? '', order: si })
        .select('id').single()
      if (stepErr || !stepRow) throw new Error(`Stap insert: ${stepErr?.message}`)

      if (!step.blocks?.length) continue
      await supabase.from('StepBlock').insert(
        step.blocks.map((b, bi) => ({
          stepId: stepRow.id, type: b.type, title: b.title,
          config: blockToConfig(b), required: REQUIRED_BLOCKS.includes(b.type), order: bi,
        }))
      )
    }
  }
  return template.id
}

// ─── Statistieken ─────────────────────────────────────────────────────────────

function logStats(tmpl: TemplateFull, id: string) {
  let flashcards = 0, quiz = 0, approval = 0, tasks = 0, acks = 0, steps = 0, blocks = 0
  for (const p of tmpl.phases) {
    steps += p.steps.length
    for (const s of p.steps) {
      blocks += s.blocks?.length ?? 0
      for (const b of s.blocks ?? []) {
        if (b.type === 'flashcards') flashcards += b.cards?.length ?? 0
        if (b.type === 'questionnaire') quiz++
        if (b.type === 'manager_approval') approval++
        if (b.type === 'task') tasks++
        if (b.type === 'acknowledgement') acks++
      }
    }
  }
  console.log(`  ✅ ID: ${id}`)
  console.log(`     ${tmpl.phases.length} fases · ${steps} stappen · ${blocks} blokken`)
  console.log(`     🃏 ${flashcards} flashcards · 📝 ${quiz} quizzen · 👍 ${approval} approvals · ✓ ${tasks} taken · ☑ ${acks} bevestigingen`)

  const warnings = []
  if (tmpl.phases.length < 4) warnings.push(`${tmpl.phases.length} fases (min. 4)`)
  if (flashcards < 10) warnings.push(`${flashcards} flashcards (min. 10)`)
  if (quiz < 2) warnings.push(`${quiz} quizzen (min. 2)`)
  if (approval < 3) warnings.push(`${approval} approvals (min. 3)`)
  if (warnings.length) console.log(`     ⚠️  ${warnings.join(', ')}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seed logistiek & transport templates (twee-pass strategie)\n')
  console.log(`📦 ${TEMPLATES_TO_GENERATE.length} templates · model: claude-haiku-4-5-20251001`)
  console.log('⏱  Verwachte duur: 8–15 minuten\n')

  const { data: company, error: companyErr } = await supabase
    .from('Company').select('id, name').eq('slug', COMPANY_SLUG).single()
  if (companyErr || !company) {
    console.error(`❌ Company "${COMPANY_SLUG}" niet gevonden: ${companyErr?.message}`)
    process.exit(1)
  }
  console.log(`🏢 Company: ${company.name} (${company.id})\n`)

  const results: { name: string; id: string }[] = []

  // Requirements per fase (4 fases, target 10+ flashcards totaal, 2+ quiz, 3+ approval)
  const PHASE_REQS: PhaseRequirements[] = [
    { flashcards: 3, needsQuiz: false, needsApproval: true  },  // fase 1: preboarding
    { flashcards: 3, needsQuiz: true,  needsApproval: true  },  // fase 2: basis & veiligheid
    { flashcards: 3, needsQuiz: true,  needsApproval: true  },  // fase 3: vakkennis (3 ipv 4 om truncatie te voorkomen)
    { flashcards: 2, needsQuiz: false, needsApproval: false },  // fase 4: zelfstandig
  ]

  for (let i = 0; i < TEMPLATES_TO_GENERATE.length; i++) {
    const { name, context } = TEMPLATES_TO_GENERATE[i]
    console.log(`[${i + 1}/${TEMPLATES_TO_GENERATE.length}] ${name}`)

    try {
      // Pass 1: structuur
      process.stdout.write('  📋 Pass 1: structuur...')
      const structure = await generateStructure(name, context)
      console.log(` ✓ (${structure.phases.length} fases)`)

      // Pass 2: blokken per fase
      console.log('  🔧 Pass 2: blokken per fase:')
      const fullPhases: PhaseFull[] = []
      for (let pi = 0; pi < structure.phases.length; pi++) {
        const reqs = PHASE_REQS[pi] ?? { flashcards: 2, needsQuiz: false, needsApproval: false }
        const phaseFull = await generatePhaseBlocks(name, context, structure.phases[pi], pi, reqs)
        fullPhases.push(phaseFull)
        await new Promise(r => setTimeout(r, 800))
      }

      const fullTemplate: TemplateFull = { name: structure.name, description: structure.description, phases: fullPhases }
      const id = await insertTemplate(company.id, fullTemplate)
      logStats(fullTemplate, id)
      results.push({ name, id })
      console.log()

      if (i < TEMPLATES_TO_GENERATE.length - 1) await new Promise(r => setTimeout(r, 1500))

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌ Mislukt: ${msg}\n`)
      if (msg.includes('credit balance is too low')) {
        console.error('💳 API-tegoed op. Voeg credits toe op console.anthropic.com en voer het script opnieuw uit.')
        console.error('   Al aangemaakte templates worden overgeslagen bij herstart.\n')
        process.exit(1)
      }
      results.push({ name, id: 'MISLUKT' })
    }
  }

  console.log('═══════════════════════════════════════════')
  console.log('🎉 Seed voltooid!')
  console.log('═══════════════════════════════════════════\n')
  for (const r of results) {
    console.log(`  ${r.id === 'MISLUKT' ? '❌' : '✅'} ${r.name}`)
    if (r.id !== 'MISLUKT') console.log(`     → /admin/templates/${r.id}/edit`)
  }
  const ok = results.filter(r => r.id !== 'MISLUKT').length
  console.log(`\n✅ ${ok}/${results.length} templates succesvol`)
}

main().catch(err => { console.error('\n💥', err); process.exit(1) })
