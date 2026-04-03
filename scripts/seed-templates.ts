/**
 * Seed script: genereert 20 uitgebreide onboarding templates via de Anthropic API
 * en slaat ze op als globale templates in Supabase.
 *
 * Uitvoeren: npx dotenv-cli -e .env.local -- npx tsx scripts/seed-templates.ts
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
  { name: 'Customer Service Medewerker POD', context: 'Print-on-demand (POD) klantenservice. Werkt dagelijks met klanten over drukfouten, bestandsaanlevering (vector vs raster, DPI, kleurruimte), levertijden, retourzendingen en techniekadvies. Moet sublimatie, DTG, UV LED, zeefdruk en tampondruk kunnen uitleggen. Verwerkt tickets in een CRM en werkt nauw samen met prepress en productie.' },
  { name: 'Sales Medewerker POD', context: 'B2B verkoop van print-on-demand producten: bedrukt textiel, promoproducten, relatiegeschenken. Maakt offertes, adviseert over druktechniek op basis van oplage/budget/kwaliteitswens, onderhandelt over levertijden en prijzen. Werkt met calculatietool en CRM. Moet klantbezwaren omgaan, cross-sellen en samenwerken met prepress en planning.' },
  { name: 'Operator POD', context: 'Productievloer operator in een POD-bedrijf. Bedient sublimatiepers (190–210°C, polyester), UV LED-printer (jigging, z-as, lakmogelijkheden), DTG-printer (pre-treatment, wit-inkt onderhoud), zeefdrukcarrousel (plastisol/watergedragen inkt) en tampondrukpers. Voert dagelijkse machine-checks uit, kalibreert kleurprofielen, keurt batches via colorimeter (deltaE < 3) en documenteert waste.' },
  { name: 'Productie Planner POD', context: 'Plant en coördineert de productie in een POD-omgeving. Beheert capaciteitsplanning over meerdere machines (UV, DTG, sublimatie, zeefdruk), prioriteert orders op levertijd en complexiteit, bewaakt machinebezetting. Werkt met ERP/MRP, kent alle doorlooptijden per druktechniek en coördineert grondstoffen met de inkoper.' },
  { name: 'Inkoper Leveranciersbeheer POD', context: 'Inkoopverantwoordelijke in een POD-bedrijf. Beheert grondstoffen (inkten, substraten, textiel), selecteert leveranciers, onderhandelt over prijs/kwaliteit/levertijd, beheert minimale voorraadniveaus. Kent kwaliteitseisen per inktsoort (UV-inkt, sublimatie-inkt, DTG watergedragen), substraateisen (polyester gehalte, coating) en werkt met inkoopsoftware.' },
  { name: 'Account Manager Promo', context: 'Account management voor promoproducten en relatiegeschenken. Beheert B2B-klanten, adviseert over productmogelijkheden (pennen, tassen, USB, textiel, verpakkingen), coördineert offertes en samples, begeleidt projecten van briefing tot levering. Werkt met internationale leveranciers en kent importprocedures, douanecodes en CE-markeringen.' },
  { name: 'Binnendienst Medewerker Promo', context: 'Binnendienst voor promoproducten: orderverwerking, klantcontact per telefoon/mail, offerte-opvolging, orderbevestigingen, bewaken levertijden en coördineren met leveranciers. Verwerkt bestellingen in ERP, handelt klachten en retourzendingen af, controleert facturen.' },
  { name: 'Sourcing Specialist Promo', context: 'Specialistische inkoper voor promoproducten. Sourcet nieuwe producten bij internationale leveranciers (China, Europa), beoordeelt samples op kwaliteit, veiligheid (CE, REACH, RoHS) en prijscompetitiviteit. Onderhandelt MOQ, levertijden en verpakkingseisen. Kent douaneprocedures (HS-codes, importrechten) en kwaliteitscontroles (pre-shipment inspection).' },
  { name: 'Projectcoördinator Promo Events', context: 'Coördineert promo-projecten voor events, beurzen en campagnes. Vertaalt klantbriefings naar productspecificaties, bewaakt tijdlijnen (productie lead time, transport, assembly), coördineert meerdere leveranciers tegelijkertijd en communiceert proactief over risico\'s.' },
  { name: 'Drukkerij Operator Offsetdruk', context: 'Operator op een offsetdrukpers. Kent opstartvolgorde, inkregeling (CMYK-balans, densiteit meten met densitometer), vloeistofbalans, plaatmontage, passercontrole en kwaliteitscontrole per vel. Weet verschil coated/oncoated papier, UV-offset en conventionele offset, laktypes (dispersionlak, UV-lak). Voert dagelijkse machine-oliebeurten en kalibratie uit.' },
  { name: 'Prepress Medewerker', context: 'Drukvoorbereiding medewerker. Controleert bestanden via preflight (resolutie min. 300 DPI, kleurruimte CMYK, snijtoleranties, veilige zone, ingebedde fonts), converteert RGB naar CMYK, maakt drukklare PDF\'s (PDF/X-1a, PDF/X-4), stelt imposities in (boekje, nesting), beheert ICC-profielen. Werkt met Adobe Illustrator, InDesign, Acrobat en prepress-software.' },
  { name: 'Klantenservice Drukkerij', context: 'Klantenservice voor een traditionele drukkerij. Beantwoordt vragen over oplagen, levertijden, bestandsaanlevering (PDF/X-1a, CMYK, snijtoleranties), papiersoorten (80–350 g/m², coated, oncoated), lak- en afwerkopties (softtouch, UV-lak, rillen, perforeren, folie). Behandelt klachten over kleurafwijkingen, snijfouten en registerfouten.' },
  { name: 'Bindery Afwerking Medewerker', context: 'Afwerking medewerker in een drukkerij. Bedient snij-, vouw-, niets- en lijmmachines. Kent: PUR-binding, perfect binding, draadnaaien, nietsbrochures, ringbanden, softtouch lamineren, UV-spot-lakken en perforeren. Werkt met kwaliteitschecklists: snijmarge ±1mm, register, vouwich. Voert dagelijkse onderhoudschecks en bladafstelling uit.' },
  { name: 'Sales Medewerker Drukkerij', context: 'Sales voor een full-service drukkerij: visitekaartjes, flyers, brochures, magazines, verpakkingen, relatiedrukwerk. Kent de calculatie (papierprijs, machinekosten, afwerking), verschil offsetdruk (volume, kwaliteit) en digitaaldruk (variabel data, korte oplagen). Adviseert over papiersoorten, lakken, afwerkopties. Maakt offertes en beheert accounts.' },
  { name: 'Operator Grootformaat Print', context: 'Operator op grootformaat printers (plotter, latex, UV-rol-naar-rol, UV-flatbed). Kent media: zelfklevende vinyl (permanent, verwijderbaar), spandoekdoek (frontlit, backlit, mesh), canvas, rigide platen (dibond, PVC schuimplaat, forex). Stelt RIP-software in (kleurprofielen, contourcutting), voert kwaliteitscontroles uit, kent installatietechnieken voor wrapfolie en banners.' },
  { name: 'Installateur Reclame-uitingen', context: 'Installeert buitenreclame en signing: foliebelettering (wet en dry apply), spandoeken, reclameborden, lightboxen, voertuigwrapping. Kent oppervlaktepreparatie, folietechnieken (squeegee, warmtegun), werken op hoogte (valbeveiliging, hoogwerker). Kent levensduur foliesoorten (3–7 jaar buiten), installatiemethoden en veiligheidsregels.' },
  { name: 'Klantenservice Grootformaat', context: 'Klantenservice voor een grootformaat print- en signingbedrijf. Adviseert over materialen (folie, doek, rigide platen), bedrukking (UV, latex, solvent), afwerkingen (laminaat, oeiletten, laslatten) en installatieopties. Beantwoordt vragen over bestandsformaten, DPI-vereisten (72–150 DPI op eindformaat), levertijden en aanlevering voor contourcutting.' },
  { name: 'Operator Textieldruk', context: 'Operator bij een textieldrukkerij. Beheerst zeefdruk (plastisol- en watergedragen inkt), DTG (pre-treatment op donker textiel), sublimatie (op polyester), heat transfer en borduurmachines. Kent pre-treatment protocollen, wasechtheid-normen (ISO 105), eisen per stofsamenstelling (100% katoen voor DTG, ≥80% polyester voor sublimatie) en kwaliteitscontrole (kleurhechting, positionering ±3mm).' },
  { name: 'Klantenservice Textiel en Borduur', context: 'Klantenservice voor een textiel- en borduurspecialist. Adviseert over garments (klasse, gewicht, pasvorm), bedrukkingstechniek (zeefdruk, DTG, sublimatie, borduur), wasadviezen, merkrichtlijnen en maatvoering. Verwerkt orders inclusief sizing tables, kleurtoewijzing en borduurbestanden (DST, PES, EMB). Behandelt klachten over kleurverloop, krimp, of borduurkwaliteit.' },
  { name: 'Sales Textiel en Workwear', context: 'B2B-sales van bedrijfskleding, werkkleding en merchandise. Adviseert over kledingkeuze (NEN-veiligheidsnormen, EN ISO 13688, HiVis normen EN 20471), bedrukking en borduur (logo-positionering), volumeprijzen en onderhoudscontracten. Beheert tendertrajecten, stelt staalkaarten samen, presenteert collecties en coördineert proeforders en grote productie-opdrachten.' },
]

// ─── Pass 1: Genereer structuur ───────────────────────────────────────────────

async function generateStructure(name: string, context: string): Promise<TemplateStructure> {
  const prompt = `Je bent een expert in het ontwerpen van onboarding programma's voor medewerkers in de print-, promo- en POD-industrie.

Maak de STRUCTUUR van een onboarding template voor: "${name}"
Branche-context: ${context}

VEREISTEN:
- Precies 4 fases: (1) Preboarding, (2) Eerste werkweek, (3) Verdieping en vakkennis, (4) Zelfstandig werken
- Elke fase heeft precies 4 stappen
- Per stap: een duidelijke titel en korte beschrijving (1-2 zinnen)

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
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as { type: string; text: string }).text.trim()
  const json = raw.startsWith('```') ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim() : raw
  return JSON.parse(json) as TemplateStructure
}

// ─── Pass 2: Genereer blokken per fase ───────────────────────────────────────

interface PhaseRequirements {
  flashcards: number        // gewenst aantal flashcards in deze fase
  needsQuiz: boolean        // voeg een questionnaire toe
  needsApproval: boolean    // voeg een manager_approval toe
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

  const prompt = `Je bent een expert in onboarding voor de print-, promo- en POD-industrie.

Template: "${templateName}"
Branche-context: ${context}
Fase ${phaseIndex + 1}: "${phase.title}"

Stappen in deze fase:
${stepsJson}

Maak voor elke stap uitgebreide blokken met ECHTE vakinhoud over deze branche.

VEREISTEN PER STAP:
1. Altijd 1 "text" blok met MINIMAAL 80 woorden echte vakkennis (concrete technieken, maten, normen, materialen; bondig maar informatief)
2. Altijd 1 "task" blok of 1 "acknowledgement" blok
${reqs.flashcards > 0 ? `3. Verspreid ${reqs.flashcards} flashcards over de stappen in deze fase (in 1-2 flashcard blokken, elke flashcard met een echte branchevraag en specifiek antwoord)` : ''}
${reqs.needsQuiz ? `4. Voeg 1 "questionnaire" blok toe met 4 meerkeuzevragen over branchekennis (4 opties per vraag, 1 correct)` : ''}
${reqs.needsApproval ? `5. Voeg 1 "manager_approval" blok toe met concrete, toetsbare beoordelingscriteria` : ''}

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
          "body": "Minimaal 120 woorden vakinhoud..."
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
          "statement": "Ik bevestig dat ik ... volledig begrijp."
        },
        {
          "type": "manager_approval",
          "title": "Goedkeuring: mijlpaal",
          "description": "Concrete criteria voor de manager"
        }
      ]
    }
  ]
}`

  process.stdout.write(`    Fase ${phaseIndex + 1} "${phase.title}"${attempt > 1 ? ` (poging ${attempt})` : ''}...`)

  // Fase 3 (verdieping) heeft meer content — gebruik hogere limiet
  const maxTokens = phaseIndex === 2 ? 12000 : 8000

  let msg
  try {
    msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
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
    case 'text':            return { body: block.body ?? '' }
    case 'task':            return { description: block.description ?? '' }
    case 'acknowledgement': return { statement: block.statement ?? '' }
    case 'flashcards':      return { cards: block.cards ?? [] }
    case 'questionnaire':   return { questions: block.questions ?? [] }
    case 'manager_approval':return { description: block.description ?? '' }
    default:                return {}
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
  console.log('🌱 Seed-templates gestart (twee-pass strategie)\n')
  console.log(`📦 ${TEMPLATES_TO_GENERATE.length} templates · model: claude-opus-4-6`)
  console.log('⏱  Verwachte duur: 15–25 minuten\n')

  const { data: company, error: companyErr } = await supabase
    .from('Company').select('id, name').eq('slug', COMPANY_SLUG).single()
  if (companyErr || !company) {
    console.error(`❌ Company "${COMPANY_SLUG}" niet gevonden: ${companyErr?.message}`)
    process.exit(1)
  }
  console.log(`🏢 Company: ${company.name} (${company.id})\n`)

  const results: { name: string; id: string }[] = []

  // Requirements per fase (4 fases per template, 10+ flashcards, 2+ quiz, 3+ approval)
  const PHASE_REQS: PhaseRequirements[] = [
    { flashcards: 3, needsQuiz: false, needsApproval: true  },  // fase 1: preboarding
    { flashcards: 3, needsQuiz: true,  needsApproval: true  },  // fase 2: eerste week
    { flashcards: 3, needsQuiz: true,  needsApproval: true  },  // fase 3: verdieping (3 i.p.v. 4 om truncatie te voorkomen)
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
        // Korte pauze
        await new Promise(r => setTimeout(r, 800))
      }

      const fullTemplate: TemplateFull = { name: structure.name, description: structure.description, phases: fullPhases }
      const id = await insertTemplate(company.id, fullTemplate)
      logStats(fullTemplate, id)
      results.push({ name, id })
      console.log()

      // Pauze tussen templates
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
