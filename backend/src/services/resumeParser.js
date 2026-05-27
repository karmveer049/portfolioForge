const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured portfolio data from a resume PDF using Gemini.
 * All content is dynamically inferred — NO hardcoded roles, titles, or domain assumptions.
 */
async function extractResumeData(pdfPath) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const pdfData = fs.readFileSync(pdfPath);
  const base64PDF = pdfData.toString("base64");

  const prompt = `
You are a resume parser. Analyze the provided resume PDF and extract structured data.
Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

CRITICAL RULES:
- Do NOT assume the person is a software developer, full-stack engineer, or tech professional unless the resume explicitly says so.
- Infer the person's actual field (e.g., Electrical Engineering, Mechanical, Research, Data Science, Finance, Design, Management, etc.) from their education, experience, and skills.
- Generate ALL text fields dynamically from the resume content. Never use generic developer boilerplate.
- The "professionalTitle" must reflect their ACTUAL background (e.g., "Electrical Engineering Student", "Mechanical Design Engineer", "Data Analyst", "UX Researcher", not "Full-Stack Developer" unless that's what they are).
- The "heroTagline" must be unique and relevant to THEIR field — not software development unless applicable.
- The "openTo" and "lookingFor" arrays must be realistic opportunities for THEIR field and career stage.
- The "ctaLine" must match their profile — not tech/startup/build language unless appropriate.
- If the person has mixed background (e.g., EE student who also codes), reflect the primary identity first, secondary as a note.

Return this exact JSON structure:

{
  "personalInfo": {
    "name": "Full name from resume",
    "email": "email if present",
    "phone": "phone if present",
    "location": "city/country if present",
    "linkedin": "LinkedIn URL if present",
    "github": "GitHub URL if present",
    "website": "personal website if present",
    "otherLinks": []
  },
  "professionalTitle": "Their actual role/title based on resume (e.g., 'Electrical Engineering Student', 'Marketing Analyst', 'Mechanical Design Intern') — infer from education+experience",
  "heroTagline": "A compelling one-liner that reflects THEIR actual field and personality. Examples for different profiles: EE student → 'Engineering circuits that power tomorrow.', Researcher → 'Turning data into discovery.', Designer → 'Crafting experiences that speak without words.' — must be unique to this person",
  "about": {
    "summary": "2–3 sentence professional summary directly derived from resume content. Mention their field, institution/company, key strengths, and what they're working toward. No generic developer text.",
    "highlights": ["3–5 bullet highlights from their actual experience/skills/achievements — field-appropriate"]
  },
  "openTo": ["3–5 realistic opportunities relevant to their field and career stage. For students: internships in their domain, research roles, etc. For professionals: roles matching their actual field. NO software-specific items unless they are a software professional."],
  "lookingFor": ["3–5 specific goals/opportunities they'd realistically seek based on their resume. Field-specific. NOT 'Remote full-stack roles' or 'AI integration' unless genuinely applicable."],
  "skills": {
    "technical": ["technical skills extracted verbatim from resume"],
    "tools": ["tools/software/instruments mentioned in resume"],
    "soft": ["soft skills mentioned or implied by experience"],
    "domain": ["domain-specific knowledge areas from their field"]
  },
  "experience": [
    {
      "title": "Job/Role Title",
      "company": "Company/Organization",
      "duration": "Date range",
      "description": "What they did — from resume",
      "highlights": ["key achievements if listed"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "year": "Year/duration",
      "gpa": "GPA if mentioned",
      "relevant": ["relevant coursework or achievements if listed"]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "What it is and what they did",
      "tech": ["technologies/tools/methods used"],
      "link": "URL if present",
      "highlights": ["key outcomes or achievements"]
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing body",
      "year": "Year if present"
    }
  ],
  "achievements": ["Notable awards, publications, competitions, etc."],
  "ctaLine": "A closing call-to-action line matching their field. NOT 'Let's build something worth remembering' for non-developers. Examples: EE → 'Let's engineer the future together.', Researcher → 'Let's explore what's possible.', Analyst → 'Let's turn your data into decisions.' — must fit their actual profile",
  "profileType": "One of: 'engineering-student' | 'cs-student' | 'software-engineer' | 'researcher' | 'designer' | 'analyst' | 'management' | 'mechanical-engineering' | 'electrical-engineering' | 'other' — used for template theming",
  "industryDomain": "Primary industry/domain inferred from resume (e.g., 'Electrical & Electronics', 'Software Development', 'Data Science', 'Mechanical Engineering', 'Finance', 'Research', 'Design', etc.)"
}
`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64PDF,
      },
    },
    { text: prompt },
  ]);

  const responseText = result.response.text();

  // Strip any accidental markdown fences
  const clean = responseText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  try {
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.error("Gemini JSON parse error:", err.message);
    console.error("Raw response:", responseText.substring(0, 500));
    throw new Error(
      "Failed to parse Gemini response as JSON. Raw: " +
        responseText.substring(0, 200)
    );
  }
}

module.exports = { extractResumeData };
