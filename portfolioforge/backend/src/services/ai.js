import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

async function generate(prompt) {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

/* Improve a bio or about section */
export async function geminiImprove(text, type = 'developer bio') {
  const prompt = `You are a professional copywriter specializing in developer portfolios.
Rewrite the following ${type} to sound polished, confident, and professional.
Keep it concise (under 3 sentences), first-person, and authentic.
Do NOT add markdown, bullet points, or headers. Return plain text only.

Original:
${text}

Improved version:`
  return generate(prompt)
}

/* Improve a project description */
export async function geminiImproveProject(description) {
  const prompt = `You are a senior software engineer reviewing portfolio project descriptions.
Rewrite the following project description to be clear, impactful, and technically specific.
Highlight what was built, key technical decisions, and real-world impact.
Keep it under 4 sentences. Plain text only, no markdown.

Original:
${description}

Improved:`
  return generate(prompt)
}

/* Categorize raw skills into groups */
export async function geminiCategorizeSkills(raw) {
  const prompt = `You are a tech skills expert.
Given this raw list of skills, categorize them into these groups:
- languages (programming languages only)
- frameworks (web/backend frameworks and libraries)
- databases (database systems)
- tools (developer tools, platforms, services)
- ai (AI/ML libraries and APIs)

Raw skills: ${raw}

Return ONLY valid JSON like:
{"languages":["Python","JavaScript"],"frameworks":["React","FastAPI"],"databases":["MySQL"],"tools":["Git","Docker"],"ai":["Scikit-learn"]}

JSON only, no explanation:`

  const text = await generate(prompt)
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { languages: [], frameworks: [], databases: [], tools: [], ai: [] }
  }
}

/* Generate a tagline */
export async function geminiGenerateTagline({ name, skills, about }) {
  const prompt = `Generate a short, memorable professional tagline for a developer portfolio.
Name: ${name}
Skills: ${skills}
About: ${about}

Requirements:
- Under 10 words
- No quotes
- Active voice
- Avoid clichés like "passionate" or "enthusiastic"
- Examples: "Building thoughtful software for modern startups." or "Engineering AI-powered web experiences."

Return ONLY the tagline, nothing else:`
  return generate(prompt)
}

/* Generate full about section from raw inputs */
export async function geminiGenerateAbout(data) {
  const prompt = `Write a professional About section for a developer portfolio.
Name: ${data.name}
College: ${data.college} — ${data.degree}
Skills: ${data.skills}
Projects: ${data.projects?.join(', ')}
Achievements: ${data.achievements?.join(', ')}

Requirements:
- 2-3 sentences
- First person
- Highlight technical strength and what they build
- Warm but professional tone
- No markdown, plain text only

Return just the bio:`
  return generate(prompt)
}
