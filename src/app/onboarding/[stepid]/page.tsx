'use client'

import { useState } from 'react'

export default function StepPage() {
  const [acknowledged, setAcknowledged] = useState(false)

  const step = {
    title: 'Kennismaking met het team',
    phase: 'Dag 1',
    description: 'Maak kennis met je directe collega\'s en leer hoe het team samenwerkt.',
    blocks: [
      {
        type: 'video',
        title: 'Welkomstvideo van de CEO',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      {
        type: 'text',
        title: 'Over ons team',
        content: 'Welkom bij het team! Wij zijn een hecht team van gedreven mensen die elke dag het beste uit zichzelf halen. In deze stap leer je wie je collega\'s zijn, hoe we samenwerken en wat onze kernwaarden zijn.',
      },
      {
        type: 'task',
        title: 'Stel jezelf voor in het teamkanaal',
        description: 'Stuur een berichtje in Slack (#algemeen) met een korte introductie over jezelf.',
      },
      {
        type: 'acknowledgement',
        title: 'Ik heb deze stap doorgelezen',
        description: 'Bevestig dat je alle informatie in deze stap hebt gelezen en begrepen.',
      },
    ],
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Stap titel */}
        <div className="mb-8">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{step.phase}</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-3">{step.title}</h1>
          <p className="text-gray-500 mt-1">{step.description}</p>
        </div>

        {/* Blokken */}
        <div className="space-y-4">
          {step.blocks.map((block, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Video blok */}
              {block.type === 'video' && (
                <div>
                  <div className="aspect-video bg-gray-900">
                    <iframe
                      src={block.url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900">{block.title}</p>
                  </div>
                </div>
              )}

              {/* Text blok */}
              {block.type === 'text' && (
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{block.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{block.content}</p>
                </div>
              )}

              {/* Task blok */}
              {block.type === 'task' && (
                <div className="p-5 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5 cursor-pointer hover:border-blue-500 transition-colors"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{block.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{block.description}</p>
                  </div>
                  <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full flex-shrink-0">Taak</span>
                </div>
              )}

              {/* Acknowledgement blok */}
              {block.type === 'acknowledgement' && (
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => setAcknowledged(!acknowledged)}
                      className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${acknowledged ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-500'}`}
                    >
                      {acknowledged && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{block.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{block.description}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Volgende stap knop */}
        <div className="mt-8 flex justify-end">
          <button
            disabled={!acknowledged}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Volgende stap →
          </button>
        </div>
      </div>
    </main>
  )
}