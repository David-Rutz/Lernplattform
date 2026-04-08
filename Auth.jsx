export async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export async function generateContent(topicName, areaName, level) {
  const levelMap = { einsteiger: 'Einsteiger (kein Vorwissen)', fortgeschrittene: 'Fortgeschrittene (Grundwissen vorhanden)', experte: 'Experte (tiefes Fachverständnis gefragt)' }
  return callClaude(`Du bist ein Schweizer Weiterbildungslehrer. Erkläre "${topicName}" im Bereich "${areaName}" für Level: ${levelMap[level]}.

Schreibe einen strukturierten Lerntext auf Deutsch (ca. 280-320 Wörter). Aufbau:
- Einleitung (1-2 Sätze, was ist das Thema?)
- Hauptteil (die 3-4 wichtigsten Konzepte in Fliesstext-Absätzen)
- Praxisbezug (1 konkretes Beispiel aus dem Schweizer Kontext)
- Merksatz am Schluss (kurz, prägnant)

Kein Markdown, keine Sterne, keine Bullet Points. Nur sauberer Fliesstext in Absätzen. Trenne Absätze mit einer Leerzeile.`)
}

export async function generateQuiz(topicName, areaName, level) {
  const levelMap = { einsteiger: 'Einsteiger', fortgeschrittene: 'Fortgeschrittene', experte: 'Experte' }
  const raw = await callClaude(`Erstelle 5 Multiple-Choice-Fragen zum Thema "${topicName}" (${areaName}, Level: ${levelMap[level]}).
Antworte NUR mit einem gültigen JSON-Array. Kein Text davor oder danach, keine Backticks.
Format: [{"q":"Frage?","opts":["Option A","Option B","Option C","Option D"],"ans":0,"explain":"Kurze Erklärung (1-2 Sätze) warum die Antwort korrekt ist"}]
"ans" ist der Index (0-3) der richtigen Antwort. Alle Fragen auf Deutsch.`)
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}
