import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Data definitie ───────────────────────────────────────────────────────────

const TEMPLATE_NAME = 'Customer Service Medewerker'
const TEMPLATE_DESCRIPTION = 'Productkennis, klantcommunicatie, systemen en procedures voor een nieuwe POD customer service medewerker.'
const COMPANY_SLUG = 'onvanta-test'

const PHASES: {
  title: string
  steps: { title: string; description: string }[]
}[] = [
  {
    title: 'Preboarding',
    steps: [
      {
        title: 'Welkom bij Onvanta',
        description: 'Lees het welkomstbericht van je manager en maak kennis met de cultuur en missie van het bedrijf.',
      },
      {
        title: 'Toegang tot systemen aanvragen',
        description: 'Vraag toegang aan tot Slack, het ticketsysteem en het CRM. Je ontvangt uitnodigingen op je werkmail.',
      },
      {
        title: 'Handboek lezen',
        description: 'Lees het medewerkerhandboek door en bevestig dat je de bedrijfsregels en procedures hebt begrepen.',
      },
    ],
  },
  {
    title: 'Dag 1',
    steps: [
      {
        title: 'Kennismaking met het team',
        description: 'Maak kennis met je directe collega\'s en je teamleider. Plan een kort kennismakingsgesprek in met elk teamlid.',
      },
      {
        title: 'Rondleiding en werkplek inrichten',
        description: 'Volg de rondleiding op kantoor en richt je werkplek in. Zorg dat je headset, laptop en scherm goed staan.',
      },
      {
        title: 'Eerste login en systeemcheck',
        description: 'Log in op alle systemen en controleer of je overal toegang hebt. Meld problemen direct aan IT.',
      },
    ],
  },
  {
    title: 'Week 1',
    steps: [
      {
        title: 'Productkennis: portfolio en diensten',
        description: 'Bestudeer het productportfolio. Na deze stap kun je alle diensten uitleggen aan een klant.',
      },
      {
        title: 'Klantcommunicatie en tone of voice',
        description: 'Leer hoe we communiceren met klanten: toon, stijl en escalatieprotocol. Oefen met voorbeeldgesprekken.',
      },
      {
        title: 'Eerste klanttickets verwerken',
        description: 'Verwerk je eerste vijf klanttickets onder begeleiding van een senior collega. Stel vragen als je twijfelt.',
      },
    ],
  },
  {
    title: 'Maand 1',
    steps: [
      {
        title: 'Zelfstandig werken in het ticketsysteem',
        description: 'Verwerk tickets zelfstandig en haal een responstijd van < 4 uur. Je teamleider monitort de kwaliteit.',
      },
      {
        title: 'Kennistoets afleggen',
        description: 'Maak de kennistoets over producten, procedures en communicatierichtlijnen. Minimale score: 80%.',
      },
      {
        title: 'Evaluatiegesprek met teamleider',
        description: 'Bespreek je eerste maand: wat ging goed, wat kan beter, en wat zijn de doelen voor de komende periode.',
      },
    ],
  },
]

// ─── Seed functie ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starten met seeden...\n')

  // 1. Haal de company op via slug
  const { data: company, error: companyError } = await supabase
    .from('Company')
    .select('id, name')
    .eq('slug', COMPANY_SLUG)
    .single()

  if (companyError || !company) {
    console.error(`❌ Company met slug "${COMPANY_SLUG}" niet gevonden.`)
    console.error('   Zorg dat de company bestaat in Supabase.')
    if (companyError) console.error('   Error:', companyError.message)
    process.exit(1)
  }

  console.log(`✅ Company gevonden: ${company.name} (${company.id})`)

  // 2. Check of template al bestaat (voorkom dubbele seed)
  const { data: existing } = await supabase
    .from('Template')
    .select('id')
    .eq('name', TEMPLATE_NAME)
    .eq('companyId', company.id)
    .single()

  if (existing) {
    console.log(`⚠️  Template "${TEMPLATE_NAME}" bestaat al (id: ${existing.id}).`)
    console.log('   Verwijder hem eerst als je opnieuw wilt seeden.')
    process.exit(0)
  }

  // 3. Maak de template aan
  const { data: template, error: templateError } = await supabase
    .from('Template')
    .insert({
      name: TEMPLATE_NAME,
      description: TEMPLATE_DESCRIPTION,
      companyId: company.id,
      published: true,
    })
    .select()
    .single()

  if (templateError || !template) {
    console.error('❌ Template aanmaken mislukt:', templateError?.message)
    process.exit(1)
  }

  console.log(`✅ Template aangemaakt: ${template.name} (${template.id})`)

  // 4. Maak fases en stappen aan
  for (let phaseIdx = 0; phaseIdx < PHASES.length; phaseIdx++) {
    const phaseData = PHASES[phaseIdx]

    const { data: phase, error: phaseError } = await supabase
      .from('TemplatePhase')
      .insert({
        templateId: template.id,
        title: phaseData.title,
        order: phaseIdx,
      })
      .select()
      .single()

    if (phaseError || !phase) {
      console.error(`❌ Fase "${phaseData.title}" aanmaken mislukt:`, phaseError?.message)
      process.exit(1)
    }

    console.log(`\n  📁 Fase ${phaseIdx + 1}: ${phase.title} (${phase.id})`)

    for (let stepIdx = 0; stepIdx < phaseData.steps.length; stepIdx++) {
      const stepData = phaseData.steps[stepIdx]

      const { data: step, error: stepError } = await supabase
        .from('TemplateStep')
        .insert({
          phaseId: phase.id,
          title: stepData.title,
          description: stepData.description,
          order: stepIdx,
        })
        .select()
        .single()

      if (stepError || !step) {
        console.error(`  ❌ Stap "${stepData.title}" aanmaken mislukt:`, stepError?.message)
        process.exit(1)
      }

      console.log(`     ✓ Stap ${stepIdx + 1}: ${step.title} (${step.id})`)
    }
  }

  console.log('\n✅ Seed compleet!')
  console.log(`\nTemplate ID: ${template.id}`)
  console.log(`Navigeer naar: /admin/templates/${template.id}`)
}

seed().catch(err => {
  console.error('Onverwachte fout:', err)
  process.exit(1)
})
