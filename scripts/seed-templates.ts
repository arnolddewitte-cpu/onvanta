/**
 * Seed script: genereert 20 uitgebreide onboarding templates via de Anthropic API
 * en slaat ze op als globale templates in Supabase.
 *
 * Uitvoeren: npx tsx scripts/seed-templates.ts
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

interface Step {
  title: string
  description: string
  blocks: Block[]
}

interface Phase {
  title: string
  steps: Step[]
}

interface GeneratedTemplate {
  name: string
  description: string
  phases: Phase[]
}

// ─── Template definities ──────────────────────────────────────────────────────

const TEMPLATES_TO_GENERATE = [
  {
    name: 'Customer Service Medewerker POD',
    context: 'Print-on-demand (POD) klantenservice. Werkt dagelijks met klanten over drukfouten, bestandsaanlevering (vector vs raster, DPI, kleurruimte), levertijden, retourzendingen en techniekadvies. Moet sublimatie, DTG, UV LED, zeefdruk en tampondruk kunnen uitleggen. Verwerkt tickets in een CRM en werkt nauw samen met prepress en productie.',
  },
  {
    name: 'Sales Medewerker POD',
    context: 'B2B verkoop van print-on-demand producten: bedrukt textiel, promoproducten, relatiegeschenken. Maakt offertes, adviseert over druktechniek op basis van oplage/budget/kwaliteitswens, onderhandelt over levertijden en prijzen. Werkt met calculatietool en CRM. Moet klantbezwaren omgaan, cross-sellen en samenwerken met prepress en planning.',
  },
  {
    name: 'Operator POD',
    context: 'Productievloer operator in een POD-bedrijf. Bedient sublimatiepers (190–210°C, polyester), UV LED-printer (jigging, z-as, lak opties), DTG-printer (pre-treatment, wit-inkt onderhoud), zeefdrukcarrousel (plastisol/watergedragen inkt) en tampondrukpers. Voert dagelijkse machine-checks uit, kalibreert kleurprofielen, keurt batches af/goed via colorimeter (deltaE < 3) en documenteert waste.',
  },
  {
    name: 'Productie Planner POD',
    context: 'Plant en coördineert de productie in een POD-omgeving. Beheert de capaciteitsplanning over meerdere machines (UV, DTG, sublimatie, zeefdruk), prioriteert orders op levertijd en complexiteit, communiceert proactief over vertragingen. Werkt met productieplanningssoftware (ERP/MRP), bewaakt machinebezetting, en coördineert grondstoffen met de inkoper. Kent alle doorlooptijden per druktechniek.',
  },
  {
    name: 'Inkoper Leveranciersbeheer POD',
    context: 'Inkoopverantwoordelijke in een POD-bedrijf. Beheert grondstoffen (inkten, substaten, textiel), selecteert en beoordeelt leveranciers, onderhandelt over prijs/kwaliteit/levertijd, beheert minimale voorraadniveaus en plaatst herbestellingen. Kent de kwaliteitseisen per inktsoort (UV-inkt, sublimatie-inkt, DTG watergedragen), substraateisen (polyester gehalte, coating) en werkt met inkoopsoftware.',
  },
  {
    name: 'Account Manager Promo',
    context: 'Account management voor promoproducten en relatiegeschenken. Beheert een portfolio van B2B-klanten, adviseert over productmogelijkheden (pennen, tassen, USB, textiel, verpakkingen), coördineert offertes en samples, begeleidt projecten van briefing tot levering. Werkt met internationale leveranciers (met name China) en kent de importprocedures, douanecodes en CE-markeringen.',
  },
  {
    name: 'Binnendienst Medewerker Promo',
    context: 'Binnendienst ondersteuning voor promoproducten: orderverwerking, klantcontact per telefoon/mail, offerte-opvolging, orderbevestigingen, bewaken levertijden en coördineren met leveranciers. Verwerkt bestellingen in ERP, handelt klachten en retourzendingen af, controleert facturen en werkt samen met account managers. Kent het promoproductassortiment en productie-mogelijkheden (bedrukking, gravure, gegraveerde full-colour etiketten).',
  },
  {
    name: 'Sourcing Specialist Promo',
    context: 'Specialistische inkoper voor promoproducten. Sourcet nieuwe producten bij internationale leveranciers (voornamelijk China, Europa), beoordeelt samples op kwaliteit, veiligheid (CE, REACH, RoHS) en prijscompetitiviteit. Onderhandelt MOQ (minimum order quantity), levertijden en verpakkingseisen. Kent douaneprocedures (HS-codes, importrechten), kwaliteitscontroles (pre-shipment inspection), en beheert de leveranciersrelaties.',
  },
  {
    name: 'Projectcoördinator Promo Events',
    context: 'Coördineert promo-projecten voor events, beurzen en campagnes. Vertaalt klantbriefings naar concrete productspecificaties, bewaakt tijdlijnen (productie lead time, transport, assembly), coördineert meerdere leveranciers tegelijkertijd en communiceert proactief over risico\'s. Werkt met projectplanningssoftware en is verantwoordelijk voor on-time delivery bij grote events.',
  },
  {
    name: 'Drukkerij Operator Offsetdruk',
    context: 'Operator op een offsetdrukpers (vel- of rollenoffset). Kent de opstartvolgorde, inkregeling (CMYK-balans, densiteit meten met densitometer), vloeistofbalans (vocht/inkt), plaatmontage, passercontrole en kwaliteitscontrole per vel. Weet het verschil tussen coated en oncoated papier, UV-offset en conventionele offset, lakken (dispersionlak, UV-lak, glans/mat). Voert dagelijkse machine-oliebeurten en wekelijkse calibratie uit.',
  },
  {
    name: 'Prepress Medewerker',
    context: 'Prepress (drukvoorbereiding) medewerker in een drukkerij. Controleert aangeleverde bestanden via preflight (resolutie min. 300 DPI, kleurruimte CMYK, snijtoleranties, veilige zone, ingebedde fonts), converteert RGB naar CMYK (colorimetrie, gamut mapping), maakt drukklare PDF\'s (PDF/X-1a, PDF/X-4), stelt imposities in (boekje, nesting, velindeling), beheert ICC-profielen en maakt proofs (soft proof, hard proof). Werkt met Adobe Illustrator, InDesign, Acrobat en gespecialiseerde prepress-software.',
  },
  {
    name: 'Klantenservice Drukkerij',
    context: 'Klantenservice voor een traditionele drukkerij (offset, digitaal). Beantwoordt vragen over oplagen, levertijden, bestandsaanlevering (PDF/X-1a, CMYK, snijtoleranties), papiersoorten (80g/m² tot 350g/m², coated, oncoated, gerecycled), lak- en afwerkopties (softtouch, UV-lak, rillen, perforeren, folie). Behandelt klachten over kleurafwijkingen, snijfouten en registerfouten. Kent het drukproces van bestand tot eindproduct.',
  },
  {
    name: 'Bindery Afwerking Medewerker',
    context: 'Afwerking (bindery) medewerker in een drukkerij. Bedient snij-, vouw-, niets- en lijmapparaten. Kent de verschillen: PUR-binding (sterk, flexibel) vs. perfect binding (lijmrug) vs. draadnaaien. Beheerst nietsbrochures, ringbanden, visitekaartjestansen, softtouch lamineren, UV-spot-lakken en perforeren. Werkt met kwaliteitschecklists: snijmarge ± 1mm, register, vouwich, paginanummering. Voert dagelijkse onderhoudschecks en bladafstelling uit.',
  },
  {
    name: 'Sales Medewerker Drukkerij',
    context: 'Sales voor een full-service drukkerij. Verkoopt: visitekaartjes, flyers, brochures, magazines, verpakkingen, grootformaat en relatiedrukwerk. Kent de calculatie (papierprijs, machinekosten, uren, afwerking, transport), begrijpt het verschil tussen offsetdruk (volume, kwaliteit) en digitaaldruk (flexibel, variabel data, korte oplagen). Adviseert over papiersoorten, lakken en afwerkopties. Maakt offertes, volgt prospects op en beheert bestaande accounts.',
  },
  {
    name: 'Operator Grootformaat Print',
    context: 'Operator op grootformaat printers (plotter, latex, UV-rol-naar-rol, UV-flatbed). Kent de media: zelfklevende vinyl (permanent, verwijderbaar), spandoekdoek (frontlit, backlit, mesh), canvas, rigide platen (dibond, PVC schuimplaat, forex). Stelt RIP-software in (kleurprofielen, contourcutting), voert kwaliteitscontroles uit (kleurhomogeniteit, kantelen), kent de installatietechnieken voor wrapfolie en banners. Weet wanneer een print gelamineerd moet worden (bescherming UV, slijtage).',
  },
  {
    name: 'Installateur Reclame-uitingen',
    context: 'Installeert buitenreclame en signing: foliebelettering (wet en dry apply), spandoeken, reclameborden, lightboxen, voertuigwrapping en winkelraamfolies. Kent de oppervlaktepreparatie (reinigen, ontvetten), de folietechnieken (squeegee, warmtegun, overlappingen), het werken op hoogte (valbeveiliging, hoogwerker). Weet de levensduur van foliesoorten (3-7 jaar buiten), de installatiemethoden op verschillende ondergronden en de veiligheidsregels voor buitenwerk.',
  },
  {
    name: 'Klantenservice Grootformaat',
    context: 'Klantenservice voor een grootformaat print- en signingbedrijf. Adviseert over materialen (folie, doek, rigide platen), bedrukking (UV, latex, solvent), afwerkingen (laminaat, oeiletten, laslatten) en installatieopties. Beantwoordt vragen over bestandsformaten (AI, PDF met uitloop), DPI-vereisten (grootformaat: 72-150 DPI op eindformaat), levertijden en aanlevering van vectorbestanden voor contourcutting.',
  },
  {
    name: 'Operator Textieldruk',
    context: 'Operator bij een textieldrukkerij. Beheerst zeefdruk op textiel (plastisol- en watergedragen inkt op diverse stoffen), DTG (direct-to-garment, pre-treatment op donker textiel), sublimatie (op polyester garments en softshell), heat transfer en borduurmachines. Kent pre-treatment protocollen, wasechtheid-normen (ISO 105), de eisen per stofsamenstelling (100% katoen voor DTG, ≥80% polyester voor sublimatie) en kwaliteitscontrole (kleurhechting, dekking, positionering ±3mm).',
  },
  {
    name: 'Klantenservice Textiel en Borduur',
    context: 'Klantenservice voor een textiel- en borduurspecialist. Adviseert over garments (klasse, gewicht, pasvorm, kleuren), bedrukkingstechniek (zeefdruk, DTG, sublimatie, borduur, heat transfer), wasadviezen per techniek, merkrichtlijnen en maatvoering. Verwerkt orders inclusief sizing tables, kleurtoewijzing en aanlevering van borduurbestanden (DST, PES, EMB). Behandelt klachten over kleurverloop, krimp, of borduurkwaliteit.',
  },
  {
    name: 'Sales Textiel en Workwear',
    context: 'B2B-sales van bedrijfskleding, werkkleding en merchandise. Adviseert klanten over kledingkeuze (NEN-veiligheidsnormen, EN ISO 13688 voor werkkledij, HiVis normen EN 20471), bedrukking en borduur (logo-positionering, kledingkleur vs inktkleur), volumeprijzen en onderhoudscontracten voor workwear. Beheert tendertrajecten, stelt staalkaarten samen, presenteert collecties en coördineert proeforders en productie van grote bedrijfskleding-opdrachten.',
  },
]

// ─── JSON schema voor de prompt ───────────────────────────────────────────────

const JSON_SCHEMA = `{
  "name": "Template naam (exact de opgegeven functietitel)",
  "description": "Beknopte omschrijving van het onboarding programma (2-3 zinnen)",
  "phases": [
    {
      "title": "Fase naam",
      "steps": [
        {
          "title": "Stap naam",
          "description": "Korte stap beschrijving (1 zin)",
          "blocks": [
            {
              "type": "text",
              "title": "Informatief blok: [onderwerp]",
              "body": "Uitgebreide vakinhoudelijke tekst (MINIMAAL 100 woorden). Gebruik specifieke branchekennis, concrete getallen, technieken en voorbeelden. Schrijf in de tweede persoon (jij/je)."
            },
            {
              "type": "task",
              "title": "Taaknaam (actieve formulering)",
              "description": "Concrete omschrijving van de taak die de medewerker moet uitvoeren, inclusief hoe het resultaat aangetoond wordt."
            },
            {
              "type": "acknowledgement",
              "title": "Bevestiging: [onderwerp]",
              "statement": "Ik bevestig dat ik [specifieke kennis/vaardigheid/procedure] volledig heb begrepen en kan toepassen in mijn dagelijkse werk."
            },
            {
              "type": "flashcards",
              "title": "Flashcards: [onderwerp]",
              "cards": [
                {"question": "Concrete branchevraag?", "answer": "Specifiek en volledig antwoord met concrete waarden/namen/procedures."},
                {"question": "Tweede vraag?", "answer": "Tweede antwoord."}
              ]
            },
            {
              "type": "questionnaire",
              "title": "Kennistoets: [onderwerp]",
              "questions": [
                {
                  "question": "Meerkeuze vraag over branchekennis?",
                  "options": ["Optie A", "Optie B", "Optie C", "Optie D"],
                  "correct": 0
                },
                {
                  "question": "Tweede vraag?",
                  "options": ["Optie A", "Optie B", "Optie C", "Optie D"],
                  "correct": 2
                }
              ]
            },
            {
              "type": "manager_approval",
              "title": "Goedkeuring manager: [mijlpaal]",
              "description": "Beschrijving van wat de manager beoordeelt en goedkeurt. Bevat concrete criteria waaraan de medewerker moet voldoen."
            }
          ]
        }
      ]
    }
  ]
}`

// ─── Genereer template via Claude ─────────────────────────────────────────────

async function generateTemplate(name: string, context: string): Promise<GeneratedTemplate> {
  const prompt = `Je bent een expert in het ontwerpen van gedetailleerde onboarding programma's voor medewerkers in de print-, promo- en POD-industrie in Nederland.

Maak een UITGEBREID onboarding template voor de functie: "${name}"

BRANCHE-CONTEXT:
${context}

VERPLICHTE STRUCTUUR (strikt volgen):
- MINIMAAL 4 fases (preboarding, eerste week, verdieping, zelfstandigheid)
- MINIMAAL 3 stappen per fase (liever 4-5)
- Elke stap heeft MINIMAAL 2 blokken: 1 text-blok (100+ woorden echte vakkennis) + 1 task OF acknowledgement
- Verspreid over het HELE template (cumulatief):
  * MINIMAAL 10 flashcards totaal (verdeeld over 2-4 flashcard blokken)
  * MINIMAAL 2 questionnaire blokken (elk met 3-5 vragen, 4 antwoordopties, 1 correct)
  * MINIMAAL 3 manager_approval blokken (op logische mijlpalen)

KWALITEITSEISEN:
- Alle tekst in het NEDERLANDS
- Tekst blokken bevatten ECHTE vakkennis: concrete technieken, maten, normen, processen, materialen
- Flashcard vragen en antwoorden zijn specifiek en informatief (geen triviale vragen)
- Quiz vragen testen echte branchekennis (meerkeuze, 4 opties, 1 correct)
- Manager approval blokken beschrijven concrete, toetsbare criteria
- Taken zijn actionable en verifieerbaar

Geef ALLEEN geldige JSON als antwoord, GEEN markdown fences, GEEN uitleg voor of na de JSON.
Gebruik dit exacte formaat:

${JSON_SCHEMA}`

  console.log(`  🤖 Claude genereert "${name}"...`)

  let rawText = ''
  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      rawText += event.delta.text
      process.stdout.write('.')
    }
  }
  console.log(' ✓')

  // Strip eventuele markdown fences
  let jsonStr = rawText.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  const parsed = JSON.parse(jsonStr) as GeneratedTemplate
  return parsed
}

// ─── Valideer template ────────────────────────────────────────────────────────

function validateTemplate(t: GeneratedTemplate): string[] {
  const warnings: string[] = []
  if (t.phases.length < 4) warnings.push(`Slechts ${t.phases.length} fases (min. 4)`)

  let totalFlashcards = 0
  let totalQuestionnaires = 0
  let totalApprovals = 0

  for (const phase of t.phases) {
    if (phase.steps.length < 3) warnings.push(`Fase "${phase.title}" heeft slechts ${phase.steps.length} stappen`)
    for (const step of phase.steps) {
      for (const block of step.blocks) {
        if (block.type === 'flashcards') totalFlashcards += block.cards?.length ?? 0
        if (block.type === 'questionnaire') totalQuestionnaires++
        if (block.type === 'manager_approval') totalApprovals++
      }
    }
  }

  if (totalFlashcards < 10) warnings.push(`Slechts ${totalFlashcards} flashcards (min. 10)`)
  if (totalQuestionnaires < 2) warnings.push(`Slechts ${totalQuestionnaires} quiz blokken (min. 2)`)
  if (totalApprovals < 3) warnings.push(`Slechts ${totalApprovals} manager approval blokken (min. 3)`)

  return warnings
}

// ─── Sla template op in Supabase ──────────────────────────────────────────────

function blockToConfig(block: Block): Record<string, unknown> {
  switch (block.type) {
    case 'text':           return { body: block.body ?? '' }
    case 'task':           return { description: block.description ?? '' }
    case 'acknowledgement':return { statement: block.statement ?? '' }
    case 'flashcards':     return { cards: block.cards ?? [] }
    case 'questionnaire':  return { questions: block.questions ?? [] }
    case 'manager_approval':return { description: block.description ?? '' }
    default:               return {}
  }
}

const REQUIRED_BLOCK_TYPES: BlockType[] = ['task', 'acknowledgement', 'manager_approval']

async function insertTemplate(companyId: string, generated: GeneratedTemplate): Promise<string> {
  // Check op duplicaat
  const { data: existing } = await supabase
    .from('Template')
    .select('id')
    .eq('name', generated.name)
    .eq('companyId', companyId)
    .maybeSingle()

  if (existing) {
    console.log(`  ⚠️  Overgeslagen – "${generated.name}" bestaat al (${existing.id})`)
    return existing.id
  }

  const { data: template, error: tmplErr } = await supabase
    .from('Template')
    .insert({
      name: generated.name,
      description: generated.description,
      companyId,
      published: true,
      isGlobal: true,
    })
    .select('id')
    .single()

  if (tmplErr || !template) throw new Error(`Template insert mislukt: ${tmplErr?.message}`)

  for (let pi = 0; pi < generated.phases.length; pi++) {
    const phase = generated.phases[pi]

    const { data: phaseRow, error: phaseErr } = await supabase
      .from('TemplatePhase')
      .insert({ templateId: template.id, title: phase.title, order: pi })
      .select('id')
      .single()

    if (phaseErr || !phaseRow) throw new Error(`Fase insert mislukt: ${phaseErr?.message}`)

    for (let si = 0; si < phase.steps.length; si++) {
      const step = phase.steps[si]

      const { data: stepRow, error: stepErr } = await supabase
        .from('TemplateStep')
        .insert({ phaseId: phaseRow.id, title: step.title, description: step.description ?? '', order: si })
        .select('id')
        .single()

      if (stepErr || !stepRow) throw new Error(`Stap insert mislukt: ${stepErr?.message}`)

      const blocks = step.blocks ?? []
      if (blocks.length === 0) continue

      const blockRows = blocks.map((block, bi) => ({
        stepId: stepRow.id,
        type: block.type,
        title: block.title,
        config: blockToConfig(block),
        required: REQUIRED_BLOCK_TYPES.includes(block.type),
        order: bi,
      }))

      const { error: blocksErr } = await supabase.from('StepBlock').insert(blockRows)
      if (blocksErr) throw new Error(`Blokken insert mislukt: ${blocksErr.message}`)
    }
  }

  return template.id
}

// ─── Statistieken loggen ──────────────────────────────────────────────────────

function logStats(t: GeneratedTemplate, id: string) {
  let flashcards = 0, questionnaires = 0, approvals = 0, tasks = 0, acks = 0
  let totalSteps = 0, totalBlocks = 0

  for (const phase of t.phases) {
    totalSteps += phase.steps.length
    for (const step of phase.steps) {
      totalBlocks += step.blocks.length
      for (const block of step.blocks) {
        if (block.type === 'flashcards') flashcards += block.cards?.length ?? 0
        if (block.type === 'questionnaire') questionnaires++
        if (block.type === 'manager_approval') approvals++
        if (block.type === 'task') tasks++
        if (block.type === 'acknowledgement') acks++
      }
    }
  }

  console.log(`  ✅ ID: ${id}`)
  console.log(`     ${t.phases.length} fases · ${totalSteps} stappen · ${totalBlocks} blokken`)
  console.log(`     🃏 ${flashcards} flashcards · 📝 ${questionnaires} quizzen · 👍 ${approvals} approvals · ✓ ${tasks} taken · ☑ ${acks} bevestigingen`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seed-templates gestart\n')
  console.log(`📦 ${TEMPLATES_TO_GENERATE.length} templates te genereren via Claude Opus 4.6`)
  console.log('⏱  Verwachte duur: 10–20 minuten\n')

  // Zoek het Onvanta Test bedrijf
  const { data: company, error: companyErr } = await supabase
    .from('Company')
    .select('id, name')
    .eq('slug', COMPANY_SLUG)
    .single()

  if (companyErr || !company) {
    console.error(`❌ Company "${COMPANY_SLUG}" niet gevonden: ${companyErr?.message}`)
    process.exit(1)
  }

  console.log(`🏢 Company: ${company.name} (${company.id})\n`)

  const results: { name: string; id: string; warnings: string[] }[] = []

  for (let i = 0; i < TEMPLATES_TO_GENERATE.length; i++) {
    const { name, context } = TEMPLATES_TO_GENERATE[i]
    console.log(`\n[${i + 1}/${TEMPLATES_TO_GENERATE.length}] ${name}`)

    try {
      const generated = await generateTemplate(name, context)
      const warnings = validateTemplate(generated)

      if (warnings.length > 0) {
        console.log(`  ⚠️  Validatiewaarschuwingen:`)
        warnings.forEach(w => console.log(`     - ${w}`))
      }

      const id = await insertTemplate(company.id, generated)
      logStats(generated, id)
      results.push({ name, id, warnings })

      // Korte pauze om rate limits te vermijden
      if (i < TEMPLATES_TO_GENERATE.length - 1) {
        await new Promise(r => setTimeout(r, 1500))
      }
    } catch (err) {
      console.error(`  ❌ Mislukt: ${err instanceof Error ? err.message : err}`)
      results.push({ name, id: 'MISLUKT', warnings: ['Generation/insert error'] })
    }
  }

  console.log('\n\n═══════════════════════════════════════════')
  console.log('🎉 Seed voltooid!')
  console.log(`═══════════════════════════════════════════`)
  console.log(`\nSamenvatting (${results.length} templates):`)
  for (const r of results) {
    const icon = r.id === 'MISLUKT' ? '❌' : r.warnings.length > 0 ? '⚠️ ' : '✅'
    console.log(`  ${icon} ${r.name}`)
    if (r.id !== 'MISLUKT') console.log(`     → /admin/templates/${r.id}/edit`)
    if (r.warnings.length > 0) r.warnings.forEach(w => console.log(`     ⚠ ${w}`))
  }

  const success = results.filter(r => r.id !== 'MISLUKT').length
  console.log(`\n✅ ${success}/${results.length} templates succesvol aangemaakt`)
}

main().catch(err => {
  console.error('\n💥 Onverwachte fout:', err)
  process.exit(1)
})
