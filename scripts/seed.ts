import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COMPANY_SLUG = 'onvanta-test'

// ─── Type ──────────────────────────────────────────────────────────────────────

interface PhaseData {
  title: string
  steps: { title: string; description: string }[]
}

interface TemplateData {
  name: string
  description: string
  phases: PhaseData[]
}

// ─── Templates ─────────────────────────────────────────────────────────────────

const TEMPLATES: TemplateData[] = [
  // ── 1. Customer Service Medewerker ──────────────────────────────────────────
  {
    name: 'Customer Service Medewerker',
    description: 'Productkennis, klantcommunicatie, systemen en procedures voor een nieuwe POD customer service medewerker.',
    phases: [
      {
        title: 'Preboarding',
        steps: [
          {
            title: 'Welkom bij het bedrijf',
            description: 'Lees het welkomstbericht van je manager en maak kennis met de cultuur en missie van het bedrijf.',
          },
          {
            title: 'Toegang tot systemen aanvragen',
            description: 'Vraag toegang aan tot Slack, het ticketsysteem en het CRM. Je ontvangt uitnodigingen op je werkmail.',
          },
          {
            title: 'Handboek en gedragscode lezen',
            description: 'Lees het medewerkerhandboek en de gedragscode door. Bevestig dat je de bedrijfsregels en procedures hebt begrepen.',
          },
        ],
      },
      {
        title: 'Dag 1',
        steps: [
          {
            title: 'Kennismaking met het team',
            description: 'Maak kennis met je directe collega\'s en teamleider. Plan een kort kennismakingsgesprek in met elk teamlid.',
          },
          {
            title: 'Rondleiding productievloer en kantoor',
            description: 'Volg de rondleiding op de productievloer en het kantoor. Je ziet alle afdelingen: prepress, druk, afwerking en expeditie.',
          },
          {
            title: 'Systemen en tools in gebruik nemen',
            description: 'Log in op alle systemen: tickettool, CRM, orderbeheersysteem en Slack. Controleer of je overal toegang hebt.',
          },
        ],
      },
      {
        title: 'Week 1 – Druktechnieken en product',
        steps: [
          {
            title: 'Introductie druktechnieken: overzicht',
            description: 'Leer de vijf hoofdtechnieken die wij gebruiken: sublimatie, UV LED, DTG (direct-to-garment), zeefdruk en tampondruk. Na deze stap weet je wanneer welke techniek ingezet wordt en waarom.',
          },
          {
            title: 'Sublimatie en UV LED in detail',
            description: 'Sublimatie werkt alleen op polyester en lichte materialen – de inkt verdampt en hecht zich moleculair aan de stof. UV LED hardt direct uit onder UV-licht en werkt op vrijwel elk vlak materiaal (keramiek, glas, metaal, hout). Leer de veelgemaakte klantfout: sublimatie op een katoenen shirt bestellen.',
          },
          {
            title: 'DTG, zeefdruk en tampondruk in detail',
            description: 'DTG print direct op textiel met watergedragen inkten – ideaal voor kleine oplagen met veel kleuren en foto\'s. Zeefdruk is de keuze bij grote oplagen (>100 stuks) met maximaal 6 spot-kleuren – kostprijs per stuk daalt sterk bij volume. Tampondruk is geschikt voor onregelmatige oppervlakken (pennen, USB-sticks, gereedschap). Leer de minimale oplagegrenzen per techniek.',
          },
          {
            title: 'Kleurkennis: PMS, CMYK en RGB',
            description: 'PMS (Pantone Matching System) zijn vaste spot-kleuren die exact reproduceerbaar zijn – klanten met huisstijlkleuren vragen hier altijd naar. CMYK is de vier-kleuren drukstandaard (Cyan, Magenta, Yellow, Key/Black) – alle full-colour print gebruikt dit. RGB is het schermkleurmodel en nooit bruikbaar voor druk – bestanden die in RGB worden aangeleverd moeten worden omgezet. Onthoud: RGB → CMYK omzetting geeft altijd kleurverschil, klanten hierop voorbereiden is cruciaal.',
          },
          {
            title: 'Veelgestelde klantvragen beantwoorden',
            description: 'Oefen met de tien meestgestelde vragen: (1) Wat is de minimale oplage? (2) Kan ik mijn logo in mijn huisstijlkleur laten drukken? (3) Hoe lang duurt productie? (4) Kan ik een sample bestellen? (5) Wat is de maximale drukgrootte? (6) Mijn bestand is in RGB, kan dat? (7) Wat is het verschil tussen zeefdruk en DTG? (8) Kan ik op een donker shirt drukken? (9) Wassen de kleuren niet uit? (10) Kan ik een proefdruk krijgen?',
          },
        ],
      },
      {
        title: 'Maand 1 – Zelfstandig aan de slag',
        steps: [
          {
            title: 'Klachten en retourzendingen afhandelen',
            description: 'Leer het retour- en klachtenproces: wanneer bied je een herdruk aan, wanneer een creditnota, en wanneer escaleer je naar de productiemanager? Veelgemaakte fouten: klant levert verkeerd bestand aan (te laag resolutie, verkeerde kleurruimte) – wie is verantwoordelijk?',
          },
          {
            title: 'Offerteproces en prijsopbouw begrijpen',
            description: 'Begrijp hoe een offerte is opgebouwd: instelpositie (setkosten), prijs per stuk bij oplopende oplage, matrijskosten bij tampondruk, PMS-toeslag bij zeefdruk. Maak zelfstandig een offerte voor een fictief klantverzoek.',
          },
          {
            title: 'Kennistoets: druktechnieken en klantcommunicatie',
            description: 'Maak de kennistoets over alle druktechnieken, kleurkennis en klantvragen. Minimale score 80%. De toets bevat casusvragen: "Een klant wil 25 T-shirts met een foto in full colour – welke techniek adviseer jij en waarom?"',
          },
          {
            title: 'Evaluatiegesprek met teamleider',
            description: 'Bespreek je eerste maand: kwaliteit van ticketafhandeling, responstijd, klanttevredenheid en kennistoetsscore. Stel drie persoonlijke leerdoelen op voor de komende periode.',
          },
        ],
      },
    ],
  },

  // ── 2. Sales Medewerker ─────────────────────────────────────────────────────
  {
    name: 'Sales Medewerker',
    description: 'Offertes maken, klantrelaties opbouwen, druktechnieken verkopen en prijsopbouw beheersen voor een nieuwe POD sales medewerker.',
    phases: [
      {
        title: 'Preboarding',
        steps: [
          {
            title: 'Welkom en bedrijfscultuur',
            description: 'Lees het welkomstbericht van de salesmanager. Bekijk het bedrijfsprofiel en onze positionering in de markt: wij zijn een full-service POD leverancier voor zakelijke klanten (B2B), geen webshop voor consumenten.',
          },
          {
            title: 'CRM-toegang en salestools instellen',
            description: 'Activeer je account in het CRM. Installeer de offerte-tool en koppel je e-mail. Vraag je salesmanager om toegang tot de bestaande klantendatabase en lopende offertes.',
          },
          {
            title: 'Productcatalogus bestuderen',
            description: 'Download en lees de volledige productcatalogus. Focus op de productcategorieën textiel, promotionele artikelen, verpakkingen en relatiegeschenken – dit zijn de vier hoofdpijlers van ons assortiment.',
          },
        ],
      },
      {
        title: 'Week 1 – Product en techniek voor sales',
        steps: [
          {
            title: 'Druktechnieken vanuit verkoopperspectief',
            description: 'Als salesmedewerker moet je direct de juiste techniek kunnen adviseren. Heuristiek: Klein aantal stuks + veel kleuren → DTG of sublimatie. Groot aantal stuks + beperkte kleuren → zeefdruk. Onregelmatige vormen (pennen, USB) → tampondruk. Harde materialen met scherp detail → UV LED. Leer dit in te schatten op basis van een klantbriefing zonder te overleggen.',
          },
          {
            title: 'Kleurkennis voor de offerte',
            description: 'PMS-kleuren kosten extra (toeslag €25–€75 per kleur per kleur bij zeefdruk) en moeten als aparte drukgang worden verwerkt. CMYK heeft geen toeslag maar geeft nooit 100% kleurgarantie op huisstijlkleuren. Leer klanten proactief te informeren: "Uw logo is PMS 286 – wij kunnen dit exact matchen bij zeefdruk, bij DTG zit er altijd een kleine afwijking. Wilt u een proefdruk?"',
          },
          {
            title: 'Prijsopbouw en calculatie',
            description: 'Begrijp de drie kostendrijvers: (1) Instelpositie / setkosten (eenmalig per order, ongeacht oplage), (2) Prijs per stuk (daalt exponentieel bij hogere oplage), (3) Toeslagen: PMS-toeslag, matrijskosten tampondruk, express-toeslag. Oefen met de calculatietool. Vuistregel: bij < 25 stuks is DTG bijna altijd goedkoper dan zeefdruk door hoge setkosten.',
          },
          {
            title: 'Veelgemaakte fouten bij aanvragen beoordelen',
            description: 'Leer de rode vlaggen herkennen bij klantaanvragen: (1) Bestand aangeleverd als JPEG of PNG met lage DPI – altijd vragen naar vectorbestand (AI, EPS, PDF). (2) Klant wil sublimatie op donker shirt – kan technisch niet, alternatief aanbieden. (3) Klant vraagt "exact dezelfde kleur als onze website" – website is RGB, druk is CMYK, dit is nooit identiek. (4) Klant verwacht levertijd van 2 dagen bij zeefdruk – minimum is 7–10 werkdagen door droogtijd per druklaag.',
          },
        ],
      },
      {
        title: 'Week 2–3 – Offertes en klantcontact',
        steps: [
          {
            title: 'Eerste offertes opstellen onder begeleiding',
            description: 'Stel drie offertes op voor fictieve klantcases uit de oefenbibliotheek. Laat elke offerte reviewen door een senior salesmedewerker. Aandachtspunten: correcte techniek, realistische levertijd, PMS-toeslagen verwerkt, correcte BTW.',
          },
          {
            title: 'Bezwaren omgaan en onderhandelen',
            description: 'De drie meestgehoorde bezwaren in POD-sales: (1) "Het is te duur" – leg de kostendrijvers uit, stel hogere oplage voor, of downgrade techniek. (2) "De concurrent is 20% goedkoper" – vraag of ze appels met appels vergelijken (zelfde kwaliteit, levertijd, kleurgarantie?). (3) "Kunnen jullie de levertijd verkorten?" – bespreek expresoptie en meerkosten.',
          },
          {
            title: 'CRM-discipline: leads en follow-up',
            description: 'Iedere klantinteractie wordt gelogd in het CRM binnen 24 uur. Stel een follow-up taak in voor iedere verstuurde offerte (standaard 3 werkdagen). Leer het verschil tussen een lead (nog geen specificaties), prospect (specificaties bekend, offerte uitgebracht) en klant (heeft al besteld).',
          },
          {
            title: 'Klantvragen over bestandsaanlevering beantwoorden',
            description: 'De meest tijdrovende servicevragen gaan over bestanden. Leer dit script: "Wij hebben een vectorbestand nodig: Adobe Illustrator (.ai), EPS of PDF met ingebedde fonts. Minimale resolutie bij rasterafbeeldingen: 300 DPI op drukformaat. Kleurruimte: CMYK. Heeft u hier hulp bij nodig? Onze prepress-afdeling kan uw bestand omzetten voor €15,– ex btw."',
          },
        ],
      },
      {
        title: 'Maand 1 – Zelfstandig en targets',
        steps: [
          {
            title: 'Zelfstandig offertetraject draaien',
            description: 'Verwerk minimaal vijf echte klantvragen zelfstandig van briefing tot ondertekende offerte. Je salesmanager is beschikbaar voor sparring maar reviewt niet meer elke offerte vooraf.',
          },
          {
            title: 'Klantpresentatie druktechnieken geven',
            description: 'Geef een productdemo van 15 minuten aan een nieuwe (interne) klant met staaltjes van alle vijf druktechnieken. Leg per techniek uit: wanneer toepasbaar, kwaliteitsniveau, levertijd en prijscategorie. Word beoordeeld door je salesmanager.',
          },
          {
            title: 'Kennistoets: sales, technieken en calculatie',
            description: 'Maak de gecombineerde kennistoets. Onderdelen: (1) Techniekherkenning op basis van een klantbriefing, (2) Calculatievraag: stel de juiste prijs voor een order van 75 hoodies DTG full-colour voor-en-achterkant, (3) Kleurkennis: wat adviseer je als een klant PMS 485 wil op een DTG-shirt? Minimale score 80%.',
          },
          {
            title: 'Evaluatiegesprek en targetafspraken',
            description: 'Bespreek de eerste maand met je salesmanager. Stel kwartaaltargets vast: omzet, aantal nieuwe klanten en offerteconversiepercentage. Bespreek je sterke punten en twee ontwikkelpunten.',
          },
        ],
      },
    ],
  },

  // ── 3. Operator ─────────────────────────────────────────────────────────────
  {
    name: 'Operator',
    description: 'Machines bedienen, kwaliteitscontrole, kleurkennis en veiligheid op de productievloer voor een nieuwe POD operator.',
    phases: [
      {
        title: 'Preboarding',
        steps: [
          {
            title: 'Welkom en veiligheidsintroductie',
            description: 'Lees het welkomstbericht en de verplichte veiligheidsinstructies voor de productievloer. Bevestig dat je de BHV-route, EHBO-kast en noodstop-locaties hebt bestudeerd op de plattegrond.',
          },
          {
            title: 'PBM en werkkleding ophalen',
            description: 'Haal je persoonlijke beschermingsmiddelen op: veiligheidsbril (verplicht bij UV LED), oordoppen (verplicht bij zeefdrukcarrousel), werkschoenen en werkkleding. Teken de ontvangst.',
          },
          {
            title: 'Roostering en werkprocessen doornemen',
            description: 'Bespreek met je teamleider je werkrooster, pauzetijden en het dagelijkse werkproces: dagstart, werkbon verwerken, productieplanning raadplegen en eindcontrole.',
          },
        ],
      },
      {
        title: 'Dag 1–2 – Veiligheid en oriëntatie',
        steps: [
          {
            title: 'Rondleiding productievloer',
            description: 'Volg de volledige rondleiding langs alle afdelingen: prepress, sublimatiepers, UV LED-printer, DTG-lijn, zeefdrukcarrousel, tampondrukpers, afwerking en expeditie. Let op de looproutes (gele lijnen) en verbodszones (rode lijnen).',
          },
          {
            title: 'Veiligheidsregels en MSDS-bladen',
            description: 'Bestudeer de veiligheidsdatabladen (MSDS) van de inkten die je gaat gebruiken: sublimatie-inkt, UV-inkt en watergedragen DTG-inkt. Leer de gevaren (huidirritatie, inademing), persoonlijke bescherming en wat te doen bij lekkage of contact.',
          },
          {
            title: 'Machine-overzicht en dagelijkse checks',
            description: 'Leer de dagelijkse startchecklist voor elke machine: inktpeil controleren, printkop reinigen, kalibratie uitvoeren en testprint beoordelen. Sla nooit een check over – een vuile printkop bij DTG kost €400–€800 aan herstelkosten.',
          },
        ],
      },
      {
        title: 'Week 1–2 – Techniek per machine',
        steps: [
          {
            title: 'Sublimatiepers bedienen',
            description: 'Sublimatie werkt met warmte en druk: de inkt verdampt bij 190–210°C en hecht aan polyester. Leer de parameters instellen: temperatuur, druk en tijd per substraat (T-shirt, mok, phonecase, vlag). Veelgemaakte fout: te lage temperatuur geeft vage kleuren; te hoge temperatuur verbrandt polyester of vervormt het product. Maak vijf testproducties onder begeleiding.',
          },
          {
            title: 'UV LED-printer bedienen',
            description: 'UV LED-inkt hardt direct uit onder UV-licht. Leer het laadproces: product uitlijnen met jigging, printprofiel selecteren in de RIP-software, wit-onderlaag instellen voor donkere materialen. Kritisch punt: de printkoppen mogen nooit het substraat raken (z-as instelling). Leer het verschil tussen gloss, mat en structuurlak instellen in de software.',
          },
          {
            title: 'DTG-printer bedienen en onderhoud',
            description: 'DTG (direct-to-garment) vereist een voorbehandeling (pre-treatment) op donkere stoffen: spray de garment uniform en droog voor in de droogtunnel. Wit-inkt verstopt sneller dan kleur-inkt – dagelijkse purge-cyclus is verplicht. Leer de media-instellingen per stofsoort (100% katoen presteert het beste; polyester ≥ 50% geeft witteveervlekken).',
          },
          {
            title: 'Zeefdrukcarrousel bedienen',
            description: 'Zeefdruk werkt met een raster dat inkt door een sjabloon duwt. Leer de opstartvolgorde: lade monteren, inkt inbrengen, druk en snelheid instellen per inkttype (plastisol vs. watergedragen). Leer de wet-on-wet techniek voor meerkleurendruk en het belang van droogtijd per laag. Veiligheid: de carrousel heeft een bewegend deel – nooit in de bewegingszone tijdens productie.',
          },
          {
            title: 'Kleurkennis voor operators: PMS en kleurprofielen',
            description: 'Als operator ben jij verantwoordelijk voor kleurnauwkeurigheid. PMS-kleuren worden gematcht via inkmenging bij zeefdruk – leer de PMS-mengformules lezen. Bij digitale druk (UV, DTG) stuur je kleur via ICC-kleurprofielen in de RIP-software. Leer hoe je een deltaE-meting uitvoert (colorimeter) en wanneer een kleurafwijking van ΔE > 3 een reden is voor afkeuring.',
          },
        ],
      },
      {
        title: 'Maand 1 – Kwaliteitscontrole en zelfstandigheid',
        steps: [
          {
            title: 'Kwaliteitscontrole en keuring',
            description: 'Elke batch doorloopt een keuringsprotocol: visuele check (vlekken, registratie, vlakdekking), dimensie-check (drukpositie ± 2mm), kleurcheck (colorimeter bij PMS-orders). Leer wanneer je een batch afkeurt en hoe je dit documenteert in het kwaliteitssysteem. Onthoud: een afgekeurde batch die toch doorgelaten wordt kost 5× zoveel in klachtenafhandeling.',
          },
          {
            title: 'Storingen diagnosticeren en melden',
            description: 'Leer de meestvoorkomende storingen per machine herkennen en de eerste stappen: (1) DTG: streepvorming in de print → printkopreinigingscyclus uitvoeren. (2) UV LED: ongelijkmatige uitharding → lamp-intensiteit meten. (3) Sublimatie: geestverschijningen (ghosting) → sublimaatpapier correct plaatsen en hitteplaat controleren. (4) Zeefdruk: doorloopverandering → viskositeit inkt meten.',
          },
          {
            title: 'Waste en grondstoffenbeheer',
            description: 'Leer hoe je grondstoffenverbruik bijhoudt: inkt per job registreren, waste-substraten tellen en het weekrapport invullen. Inktbesparing tip: correcte mediaprofielen besparen gemiddeld 12% inkt. Leer hoe chemisch afval (inkt, reinigingsmiddelen) gescheiden wordt ingenomen conform de milieuregels.',
          },
          {
            title: 'Kennistoets: machines, kleur en veiligheid',
            description: 'Maak de kennistoets voor operators. Onderdelen: (1) Techniekidentificatie op basis van een productfoto, (2) Veiligheidsvraag: wat doe je als UV-inkt op je huid komt?, (3) Kleurvraag: een klant keurt een batch af omdat PMS 485 te oranje oogt – wat zijn de drie mogelijke oorzaken?, (4) Praktijkcase: stel de correcte parameters in voor sublimatie op een keramische mok. Minimale score 80%.',
          },
        ],
      },
    ],
  },
]

// ─── Helper: seed één template ────────────────────────────────────────────────

async function seedTemplate(companyId: string, templateData: TemplateData) {
  // Check op duplicaat
  const { data: existing } = await supabase
    .from('Template')
    .select('id')
    .eq('name', templateData.name)
    .eq('companyId', companyId)
    .single()

  if (existing) {
    console.log(`  ⚠️  Overgeslagen – "${templateData.name}" bestaat al (${existing.id})`)
    return
  }

  const { data: template, error: templateError } = await supabase
    .from('Template')
    .insert({
      name: templateData.name,
      description: templateData.description,
      companyId,
      published: true,
    })
    .select()
    .single()

  if (templateError || !template) {
    console.error(`  ❌ Template aanmaken mislukt: ${templateError?.message}`)
    process.exit(1)
  }

  console.log(`\n✅ Template: ${template.name}`)
  console.log(`   ID: ${template.id}`)
  console.log(`   URL: /admin/templates/${template.id}/edit`)

  for (let pi = 0; pi < templateData.phases.length; pi++) {
    const phaseData = templateData.phases[pi]

    const { data: phase, error: phaseError } = await supabase
      .from('TemplatePhase')
      .insert({ templateId: template.id, title: phaseData.title, order: pi })
      .select()
      .single()

    if (phaseError || !phase) {
      console.error(`  ❌ Fase "${phaseData.title}" mislukt: ${phaseError?.message}`)
      process.exit(1)
    }

    console.log(`\n   📁 Fase ${pi + 1}: ${phase.title}`)

    for (let si = 0; si < phaseData.steps.length; si++) {
      const stepData = phaseData.steps[si]

      const { data: step, error: stepError } = await supabase
        .from('TemplateStep')
        .insert({ phaseId: phase.id, title: stepData.title, description: stepData.description, order: si })
        .select()
        .single()

      if (stepError || !step) {
        console.error(`     ❌ Stap "${stepData.title}" mislukt: ${stepError?.message}`)
        process.exit(1)
      }

      console.log(`      ✓ ${step.title}`)
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeden gestart...\n')

  const { data: company, error: companyError } = await supabase
    .from('Company')
    .select('id, name')
    .eq('slug', COMPANY_SLUG)
    .single()

  if (companyError || !company) {
    console.error(`❌ Company "${COMPANY_SLUG}" niet gevonden.`)
    if (companyError) console.error('   Error:', companyError.message)
    process.exit(1)
  }

  console.log(`Company: ${company.name} (${company.id})\n`)
  console.log(`${TEMPLATES.length} templates te seeden...`)

  for (const templateData of TEMPLATES) {
    await seedTemplate(company.id, templateData)
  }

  console.log('\n\n🎉 Seed volledig klaar!')
}

seed().catch(err => {
  console.error('Onverwachte fout:', err)
  process.exit(1)
})
