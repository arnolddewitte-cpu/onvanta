'use client'

import { useState, useEffect } from 'react'

interface Card {
  question: string
  answer: string
  setTitle: string
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [noInstance, setNoInstance] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/me/flashcards')
      .then(r => r.json())
      .then(d => {
        if (d.instance === null) { setNoInstance(true); return }
        setCards(Array.isArray(d.cards) ? d.cards : [])
      })
      .finally(() => setLoading(false))
  }, [])

  function handleResult(result: 'correct' | 'doubt' | 'wrong') {
    const newResults = [...results, result]
    setResults(newResults)
    setFlipped(false)
    if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function restart() {
    setCurrentIndex(0)
    setFlipped(false)
    setDone(false)
    setResults([])
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Laden...</p>
      </main>
    )
  }

  if (noInstance) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="text-4xl mb-4">🃏</div>
          <p className="text-gray-500 text-sm">Geen actieve onboarding gevonden.</p>
        </div>
      </main>
    )
  }

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="text-4xl mb-4">🃏</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Geen flashcards</h1>
          <p className="text-gray-500 text-sm">Er zijn nog geen flashcards toegevoegd aan jouw onboarding.</p>
        </div>
      </main>
    )
  }

  if (done) {
    const correct = results.filter(r => r === 'correct').length
    const doubt   = results.filter(r => r === 'doubt').length
    const wrong   = results.filter(r => r === 'wrong').length

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sessie afgerond!</h1>
          <p className="text-gray-500 mb-8">Je hebt alle {cards.length} kaarten doorlopen.</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-green-600">{correct}</p>
              <p className="text-xs text-green-600 mt-1">Geweten</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-yellow-600">{doubt}</p>
              <p className="text-xs text-yellow-600 mt-1">Twijfel</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-red-600">{wrong}</p>
              <p className="text-xs text-red-600 mt-1">Fout</p>
            </div>
          </div>
          <button
            onClick={restart}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Opnieuw oefenen
          </button>
        </div>
      </main>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">{currentIndex + 1} / {cards.length}</span>
          <div className="flex gap-1">
            {cards.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${
                i < currentIndex ? 'bg-blue-600' : i === currentIndex ? 'bg-blue-300' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>

        {currentCard.setTitle && (
          <p className="text-xs text-gray-400 mb-3 text-center">{currentCard.setTitle}</p>
        )}

        <div
          onClick={() => setFlipped(!flipped)}
          className="bg-white rounded-2xl border border-gray-100 p-8 min-h-64 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow mb-6"
        >
          {!flipped ? (
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">Vraag</p>
              <p className="text-lg font-semibold text-gray-900">{currentCard.question}</p>
              <p className="text-xs text-gray-400 mt-6">Klik om het antwoord te zien</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">Antwoord</p>
              <p className="text-sm text-gray-700 leading-relaxed">{currentCard.answer}</p>
            </div>
          )}
        </div>

        {!flipped ? (
          <button
            onClick={() => setFlipped(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Toon antwoord
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleResult('wrong')}
              className="bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              😕 Fout
            </button>
            <button
              onClick={() => handleResult('doubt')}
              className="bg-yellow-50 text-yellow-600 py-3 rounded-xl text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              🤔 Twijfel
            </button>
            <button
              onClick={() => handleResult('correct')}
              className="bg-green-50 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
            >
              ✅ Geweten
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
