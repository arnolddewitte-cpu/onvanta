import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic()

interface GeneratedBlock {
  type: 'video' | 'text' | 'task' | 'acknowledgement' | 'flashcards'
  title: string
  url?: string
  body?: string
  description?: string
  statement?: string
  cards?: { question: string; answer: string }[]
}

interface GeneratedStep {
  title: string
  blocks: GeneratedBlock[]
}

interface GeneratedPhase {
  title: string
  steps: GeneratedStep[]
}

interface GeneratedTemplate {
  name: string
  description: string
  phases: GeneratedPhase[]
}

function buildBlockConfig(block: GeneratedBlock): Record<string, unknown> {
  switch (block.type) {
    case 'video':        return { url: block.url ?? '' }
    case 'text':         return { body: block.body ?? '' }
    case 'task':         return { description: block.description ?? '' }
    case 'acknowledgement': return { statement: block.statement ?? '' }
    case 'flashcards':   return { cards: block.cards ?? [] }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, context, companyId } = await req.json()

    if (!role?.trim()) {
      return NextResponse.json({ error: 'Functietitel is verplicht' }, { status: 400 })
    }

    // 1. Genereer template structuur met Claude
    const prompt = `Je bent een expert in het ontwerpen van onboarding programma's voor nieuwe medewerkers.

Maak een gedetailleerd onboarding template voor de functie: "${role}"${context ? `\nExtra context: ${context}` : ''}

Geef je antwoord ALLEEN als geldige JSON (geen uitleg, geen markdown), in dit exacte formaat:
{
  "name": "Template naam",
  "description": "Korte omschrijving van het onboarding programma",
  "phases": [
    {
      "title": "Fase naam",
      "steps": [
        {
          "title": "Stap naam",
          "blocks": [
            {
              "type": "text",
              "title": "Blok titel",
              "body": "Inhoud van het tekstblok (2-4 alinea's relevante informatie)"
            }
          ]
        }
      ]
    }
  ]
}

Regels:
- Maak 3-5 fases (bijv. Week 1, Week 2-4, Eerste maand, etc.)
- Elke fase heeft 3-6 stappen
- Elke stap heeft 1-3 blokken
- Gebruik alleen deze bloktypen: video, text, task, acknowledgement, flashcards
- Voor "video": geef een leeg "url" veld
- Voor "text": geef relevante "body" inhoud (Nederlands, 2-4 zinnen per blok)
- Voor "task": geef een concrete "description" van de taak
- Voor "acknowledgement": geef een "statement" dat de medewerker moet bevestigen
- Voor "flashcards": geef een "cards" array met minimaal 3 items, elk met "question" en "answer"
- Schrijf alles in het Nederlands
- Maak de inhoud specifiek en realistisch voor de functie`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('')

    // Parse JSON — strip eventuele markdown code fences (ook als sluit-fence ontbreekt door truncatie)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? rawText.match(/```(?:json)?\s*([\s\S]*)/)
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText.trim()

    let generated: GeneratedTemplate
    try {
      generated = JSON.parse(jsonStr)
    } catch {
      console.error('Claude JSON parse error:', jsonStr.slice(0, 500))
      return NextResponse.json({ error: 'AI kon geen geldig template genereren' }, { status: 500 })
    }

    // 2. Bepaal companyId
    let resolvedCompanyId = companyId
    if (!resolvedCompanyId) {
      const { data: company } = await supabaseAdmin
        .from('Company')
        .select('id')
        .limit(1)
        .single()
      if (!company) {
        return NextResponse.json({ error: 'Geen company gevonden' }, { status: 500 })
      }
      resolvedCompanyId = company.id
    }

    // 3. Maak het Template aan
    const { data: template, error: templateError } = await supabaseAdmin
      .from('Template')
      .insert({
        name: generated.name,
        description: generated.description,
        companyId: resolvedCompanyId,
        published: false,
      })
      .select()
      .single()

    if (templateError || !template) {
      console.error('Template insert error:', templateError)
      return NextResponse.json({ error: 'Kon template niet opslaan' }, { status: 500 })
    }

    // 4. Maak fases, stappen en blokken aan
    for (let pi = 0; pi < generated.phases.length; pi++) {
      const phase = generated.phases[pi]

      const { data: dbPhase, error: phaseError } = await supabaseAdmin
        .from('TemplatePhase')
        .insert({ templateId: template.id, title: phase.title, order: pi })
        .select()
        .single()

      if (phaseError || !dbPhase) {
        console.error('Phase insert error:', phaseError)
        continue
      }

      for (let si = 0; si < phase.steps.length; si++) {
        const step = phase.steps[si]

        const { data: dbStep, error: stepError } = await supabaseAdmin
          .from('TemplateStep')
          .insert({ phaseId: dbPhase.id, title: step.title, order: si })
          .select()
          .single()

        if (stepError || !dbStep) {
          console.error('Step insert error:', stepError)
          continue
        }

        if (step.blocks.length === 0) continue

        const blockRows = step.blocks.map((block, bi) => ({
          stepId: dbStep.id,
          type: block.type,
          title: block.title,
          order: bi,
          required: true,
          config: buildBlockConfig(block),
        }))

        const { error: blocksError } = await supabaseAdmin
          .from('StepBlock')
          .insert(blockRows)

        if (blocksError) {
          console.error('Blocks insert error:', blocksError)
        }
      }
    }

    return NextResponse.json({ id: template.id, name: template.name })

  } catch (err) {
    console.error('Generate template error:', err)
    return NextResponse.json({ error: 'Er ging iets mis bij het genereren' }, { status: 500 })
  }
}
