import { supabase } from './supabase'

async function callClaude(prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// Returns cached content or generates + caches it
async function cachedCall(topicId, level, type, generateFn) {
  // 1. Check cache
  const { data: cached } = await supabase
    .from('content_cache')
    .select('content')
    .eq('topic_id', topicId)
    .eq('level', level)
    .eq('type', type)
    .single()

  if (cached) return { text: cached.content, fromCache: true }

  // 2. Generate
  const text = await generateFn()
  if (!text) return { text: null, fromCache: false }

  // 3. Store
  await supabase.from('content_cache').insert({ topic_id: topicId, level, type, content: text })

  return { text, fromCache: false }
}

export async function generateContent(topicId, topicName, areaName, level) {
  const levelMap = {
    einsteiger:      'Einsteiger (kein Vorwissen)',
    fortgeschrittene:'Fortgeschrittene (Grundwissen vorhanden)',
    experte:         'Experte (tiefes Fachverständnis gefragt)'
  }
  return cachedCall(topicId, level, 'content', () =>
    callClaude(`Du bist ein Schweizer Weiterbildungslehrer. Erkläre "${topicName}" im Bereich "${areaName}" für Level: ${levelMap[level]}.

Schreibe einen strukturierten Lerntext auf Deutsch (ca. 280-320 Wörter). Aufbau:
- Einleitung (1-2 Sätze, was ist das Thema?)
- Hauptteil (die 3-4 wichtigsten Konzepte in Fliesstext-Absätzen)
- Praxisbezug (1 konkretes Beispiel aus dem Schweizer Kontext)
- Merksatz am Schluss (kurz, prägnant)

Kein Markdown, keine Sterne, keine Bullet Points. Nur sauberer Fliesstext in Absätzen. Trenne Absätze mit einer Leerzeile.`)
  )
}

export async function generateQuiz(topicId, topicName, areaName, level) {
  const levelMap = { einsteiger: 'Einsteiger', fortgeschrittene: 'Fortgeschrittene', experte: 'Experte' }
  const result = await cachedCall(topicId, level, 'quiz', () =>
    callClaude(`Erstelle 5 Multiple-Choice-Fragen zum Thema "${topicName}" (${areaName}, Level: ${levelMap[level]}).
Antworte NUR mit einem gültigen JSON-Array. Kein Text davor oder danach, keine Backticks.
Format: [{"q":"Frage?","opts":["Option A","Option B","Option C","Option D"],"ans":0,"explain":"Kurze Erklärung (1-2 Sätze) warum die Antwort korrekt ist"}]
"ans" ist der Index (0-3) der richtigen Antwort. Alle Fragen auf Deutsch.`)
  )
  if (!result.text) return null
  try {
    return { questions: JSON.parse(result.text.replace(/```json|```/g, '').trim()), fromCache: result.fromCache }
  } catch {
    return null
  }
}
