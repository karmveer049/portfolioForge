/**
 * resumeParser.js
 *
 * Step 1: Extract raw text from PDF or DOCX
 * Step 2: Send raw text to Gemini with a structured extraction prompt
 * Step 3: Return clean JSON that maps directly to Portfolio schema fields
 */

import fs from 'fs/promises'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'

/* ── Text extraction ──────────────────────────────────── */

async function extractFromPDF(buffer) {
  // Dynamically import pdf-parse (CJS module)
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const data = await pdfParse(buffer)
  return data.text
}

async function extractFromDOCX(buffer) {
  const mammoth = await import('mammoth')
  const result  = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function extractTextFromFile(buffer, mimetype) {
  const type = mimetype?.toLowerCase() || ''

  if (type.includes('pdf')) {
    return extractFromPDF(buffer)
  }

  if (
    type.includes('word') ||
    type.includes('docx') ||
    type.includes('document') ||
    type.includes('msword')
  ) {
    return extractFromDOCX(buffer)
  }

  // Plain text fallback
  return buffer.toString('utf8')
}

/* ── Gemini structured extraction ─────────────────────── */

const EXTRACTION_PROMPT = `You are an expert resume parser for a developer portfolio platform.

Extract ALL information from the resume text below and return it as a single valid JSON object.

IMPORTANT RULES:
- Return ONLY raw JSON. No markdown, no code blocks, no explanation.
- If a field is not found, use null for strings and [] for arrays.
- For skills, separate them by category as best you can.
- For projects, extract as much detail as possible.
- Convert dates to readable format like "Jul 2025" or "2023 – 2027".
- For phone, include country code if present.
- Confidence score: 0-100 based on how complete the resume is.

Return this exact JSON structure:
{
  "confidence": 85,
  "personal": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+91 99999 99999",
    "location": "City, State",
    "tagline": null
  },
  "socials": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "portfolio": null,
    "twitter": null,
    "leetcode": null,
    "kaggle": null
  },
  "about": "A brief professional bio extracted or inferred from the resume.",
  "academics": {
    "college": "College Name",
    "degree": "B.Tech Computer Science",
    "cgpa": "9.07 / 10",
    "gradYear": "2027",
    "tenth": null,
    "twelfth": null
  },
  "skills": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["React", "FastAPI"],
    "databases": ["MySQL", "MongoDB"],
    "tools": ["Git", "Docker", "VS Code"],
    "ai": ["Scikit-learn", "Gemini API"]
  },
  "projects": [
    {
      "title": "Project Name",
      "description": "What was built and how.",
      "stack": ["FastAPI", "React"],
      "liveUrl": "https://...",
      "githubUrl": "https://github.com/...",
      "highlight": "Key metric or achievement"
    }
  ],
  "experience": [
    {
      "role": "Machine Learning Intern",
      "company": "Company Name",
      "startDate": "Jul 2025",
      "endDate": "Aug 2025",
      "type": "Remote",
      "description": "What was done.",
      "tech": ["Python", "Scikit-learn"]
    }
  ],
  "certifications": [
    {
      "title": "Certificate Name",
      "org": "Issuing Organization",
      "url": null
    }
  ],
  "achievements": [
    {
      "title": "GATE 2026 Qualified",
      "desc": "Qualified in Electrical Engineering"
    }
  ],
  "missingFields": ["tagline", "about", "tenth", "twelfth"],
  "suggestedTheme": "soft-editorial"
}

Resume text to parse:
`

export async function parseResumeWithAI(rawText) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

  // Trim very long resumes to avoid token limits
  const trimmedText = rawText.slice(0, 8000)

  const result = await model.generateContent(EXTRACTION_PROMPT + trimmedText)
  const text   = result.response.text().trim()

  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  try {
    return JSON.parse(clean)
  } catch (parseErr) {
    console.error('[ResumeParser] JSON parse failed. Raw output:', text.slice(0, 300))
    throw new Error('AI returned malformed JSON. Please try again.')
  }
}

/* ── AI Enhancement pass ──────────────────────────────── */

export async function enhanceParsedData(parsed) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

  const tasks = []

  // Generate about if missing or too short
  if (!parsed.about || parsed.about.length < 60) {
    tasks.push(
      model.generateContent(
        `Write a professional 2-sentence developer bio for a portfolio website.
Name: ${parsed.personal?.name}
Degree: ${parsed.academics?.degree} at ${parsed.academics?.college}
Skills: ${[...( parsed.skills?.languages || []), ...(parsed.skills?.frameworks || [])].slice(0, 6).join(', ')}
Projects: ${parsed.projects?.map(p => p.title).join(', ')}
Achievements: ${parsed.achievements?.map(a => a.title).join(', ')}
Return plain text only, no quotes, no markdown.`
      ).then(r => ({ field: 'about', value: r.response.text().trim() }))
    )
  }

  // Generate tagline if missing
  if (!parsed.personal?.tagline) {
    tasks.push(
      model.generateContent(
        `Create a sharp 8-word professional tagline for a developer portfolio.
Skills: ${[...(parsed.skills?.languages || []), ...(parsed.skills?.frameworks || [])].slice(0, 4).join(', ')}
Do not use "passionate", "enthusiastic", or "driven".
Example: "Building thoughtful software for modern startups."
Return the tagline only, no quotes.`
      ).then(r => ({ field: 'tagline', value: r.response.text().trim() }))
    )
  }

  // Enhance weak project descriptions
  const enhancedProjects = await Promise.all(
    (parsed.projects || []).map(async (proj) => {
      if (!proj.description || proj.description.length < 80) {
        try {
          const res = await model.generateContent(
            `Rewrite this project description for a developer portfolio. 
Make it technically specific, mention what was built, key tech used, and real-world value.
Keep it under 3 sentences. Plain text only.

Original: ${proj.description || proj.title}
Stack: ${(proj.stack || []).join(', ')}

Improved description:`
          )
          return { ...proj, description: res.response.text().trim() }
        } catch {
          return proj
        }
      }
      return proj
    })
  )

  // Wait for parallel about + tagline tasks
  const enhancements = await Promise.allSettled(tasks)

  const result = {
    ...parsed,
    projects: enhancedProjects,
  }

  for (const task of enhancements) {
    if (task.status === 'fulfilled') {
      const { field, value } = task.value
      if (field === 'about') result.about = value
      if (field === 'tagline') result.personal = { ...result.personal, tagline: value }
    }
  }

  return result
}
