/**
 * portfolioGenerator.js
 *
 * Generates a complete single-file HTML portfolio from structured resume data.
 * ALL content comes from the parsed resume — zero hardcoded role/domain assumptions.
 * Design/theme is preserved; only content generation is dynamic.
 */

/**
 * Safe fallback: if a field is missing, return empty string or empty array
 */
const safe = (val, fallback = "") => val || fallback;
const safeArr = (val) => (Array.isArray(val) && val.length > 0 ? val : null);

/**
 * Render a list of items as <li> elements
 */
function renderList(items) {
  if (!items || items.length === 0) return "";
  return items.map((item) => `<li>${item}</li>`).join("\n");
}

/**
 * Render skill tags
 */
function renderTags(items, className = "skill-tag") {
  if (!items || items.length === 0) return "";
  return items
    .map((item) => `<span class="${className}">${item}</span>`)
    .join("\n");
}

/**
 * Render experience cards
 */
function renderExperience(experience) {
  if (!safeArr(experience)) return "<p>No experience listed.</p>";
  return experience
    .map(
      (exp) => `
    <div class="exp-card">
      <div class="exp-header">
        <div>
          <h3 class="exp-title">${safe(exp.title, "Role")}</h3>
          <p class="exp-company">${safe(exp.company, "Organization")}</p>
        </div>
        <span class="exp-duration">${safe(exp.duration)}</span>
      </div>
      ${exp.description ? `<p class="exp-desc">${exp.description}</p>` : ""}
      ${
        safeArr(exp.highlights)
          ? `<ul class="exp-highlights">${renderList(exp.highlights)}</ul>`
          : ""
      }
    </div>
  `
    )
    .join("\n");
}

/**
 * Render education cards
 */
function renderEducation(education) {
  if (!safeArr(education)) return "";
  return education
    .map(
      (edu) => `
    <div class="edu-card">
      <div class="edu-header">
        <div>
          <h3 class="edu-degree">${safe(edu.degree)}</h3>
          <p class="edu-institution">${safe(edu.institution)}</p>
        </div>
        <span class="edu-year">${safe(edu.year)}</span>
      </div>
      ${edu.gpa ? `<p class="edu-gpa">GPA: ${edu.gpa}</p>` : ""}
      ${
        safeArr(edu.relevant)
          ? `<div class="edu-relevant"><strong>Relevant:</strong> ${edu.relevant.join(", ")}</div>`
          : ""
      }
    </div>
  `
    )
    .join("\n");
}

/**
 * Render project cards
 */
function renderProjects(projects) {
  if (!safeArr(projects)) return "<p>No projects listed.</p>";
  return projects
    .map(
      (proj) => `
    <div class="proj-card">
      <div class="proj-header">
        <h3 class="proj-name">${safe(proj.name)}</h3>
        ${
          proj.link
            ? `<a href="${proj.link}" target="_blank" class="proj-link">View ↗</a>`
            : ""
        }
      </div>
      <p class="proj-desc">${safe(proj.description)}</p>
      ${
        safeArr(proj.tech)
          ? `<div class="proj-tech">${renderTags(proj.tech, "tech-tag")}</div>`
          : ""
      }
      ${
        safeArr(proj.highlights)
          ? `<ul class="proj-highlights">${renderList(proj.highlights)}</ul>`
          : ""
      }
    </div>
  `
    )
    .join("\n");
}

/**
 * Render certifications
 */
function renderCerts(certifications) {
  if (!safeArr(certifications)) return "";
  return certifications
    .map(
      (cert) => `
    <div class="cert-item">
      <strong>${safe(cert.name)}</strong>
      ${cert.issuer ? `<span class="cert-issuer"> — ${cert.issuer}</span>` : ""}
      ${cert.year ? `<span class="cert-year">${cert.year}</span>` : ""}
    </div>
  `
    )
    .join("\n");
}

/**
 * Build contact links from personalInfo
 */
function renderContactLinks(info) {
  const links = [];
  if (info.email)
    links.push(
      `<a href="mailto:${info.email}" class="contact-link">✉ ${info.email}</a>`
    );
  if (info.phone)
    links.push(`<span class="contact-link">📞 ${info.phone}</span>`);
  if (info.linkedin)
    links.push(
      `<a href="${info.linkedin}" target="_blank" class="contact-link">LinkedIn ↗</a>`
    );
  if (info.github)
    links.push(
      `<a href="${info.github}" target="_blank" class="contact-link">GitHub ↗</a>`
    );
  if (info.website)
    links.push(
      `<a href="${info.website}" target="_blank" class="contact-link">Website ↗</a>`
    );
  if (safeArr(info.otherLinks)) {
    info.otherLinks.forEach((link) => {
      links.push(
        `<a href="${link.url || link}" target="_blank" class="contact-link">${link.label || "Link"} ↗</a>`
      );
    });
  }
  return links.join("\n");
}

/**
 * Main generator function
 * @param {Object} resumeData - Parsed resume data from Gemini
 * @returns {string} - Complete HTML portfolio string
 */
function generatePortfolioHTML(resumeData) {
  const info = resumeData.personalInfo || {};
  const name = safe(info.name, "Portfolio");
  const firstName = name.split(" ")[0];

  const title = safe(resumeData.professionalTitle, resumeData.industryDomain || "Professional");
  const tagline = safe(resumeData.heroTagline, `Driven by curiosity and purpose.`);
  const summary = safe(resumeData.about?.summary, "");
  const highlights = safeArr(resumeData.about?.highlights);
  const openTo = safeArr(resumeData.openTo);
  const lookingFor = safeArr(resumeData.lookingFor);
  const ctaLine = safe(resumeData.ctaLine, `Let's connect and create something meaningful.`);
  const skills = resumeData.skills || {};
  const achievements = safeArr(resumeData.achievements);

  // Split tagline for the styled hero format (italic last word)
  const taglineWords = tagline.trim().replace(/\.$/, "").split(" ");
  const taglineMain = taglineWords.slice(0, -1).join(" ");
  const taglineLast = taglineWords[taglineWords.length - 1] + ".";

  // Split CTA line similarly
  const ctaWords = ctaLine.trim().replace(/\.$/, "").split(" ");
  const ctaMain = ctaWords.slice(0, -2).join(" ");
  const ctaAccent = ctaWords.slice(-2).join(" ") + ".";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} — Portfolio</title>
  <meta name="description" content="${title} — ${tagline}"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    /* ===========================
       CSS VARIABLES & RESET
    =========================== */
    :root {
      --bg: #f5f0e8;
      --text: #1a1612;
      --accent: #b8860b;
      --accent-light: #d4a017;
      --muted: #6b6054;
      --card-bg: #ede8de;
      --border: #d4cfc5;
      --font-serif: 'Playfair Display', Georgia, serif;
      --font-sans: 'Inter', system-ui, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 16px;
      line-height: 1.6;
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ===========================
       LAYOUT
    =========================== */
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    section {
      padding: 5rem 0;
      border-bottom: 1px solid var(--border);
    }

    section:last-child { border-bottom: none; }

    .section-label {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 2rem;
    }

    /* ===========================
       NAVBAR
    =========================== */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(245, 240, 232, 0.92);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
    }

    .nav-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-name {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text);
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-links a {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--muted);
      letter-spacing: 0.05em;
    }

    .nav-links a:hover { color: var(--accent); text-decoration: none; }

    /* ===========================
       HERO SECTION
    =========================== */
    #hero {
      padding: 7rem 0 6rem;
      border-bottom: 1px solid var(--border);
    }

    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .hero-eyebrow::before {
      content: '';
      width: 2.5rem;
      height: 1px;
      background: var(--accent);
    }

    .hero-eyebrow span {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .hero-name {
      font-family: var(--font-serif);
      font-size: clamp(4rem, 12vw, 9rem);
      font-weight: 700;
      line-height: 0.95;
      letter-spacing: -0.02em;
      margin-bottom: 2.5rem;
    }

    .hero-tagline {
      font-family: var(--font-serif);
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      font-weight: 400;
      line-height: 1.3;
      max-width: 600px;
      margin-bottom: 2rem;
    }

    .hero-tagline em {
      font-style: italic;
      color: var(--accent);
    }

    .hero-summary {
      font-size: 1rem;
      color: var(--muted);
      max-width: 560px;
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }

    .hero-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    /* ===========================
       ABOUT SECTION
    =========================== */
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: start;
    }

    @media (max-width: 640px) {
      .about-grid { grid-template-columns: 1fr; }
    }

    .about-text p {
      font-size: 1rem;
      color: var(--muted);
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .highlights-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .highlights-list li {
      padding-left: 1.2rem;
      position: relative;
      font-size: 0.95rem;
      color: var(--muted);
    }

    .highlights-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: var(--accent);
      font-size: 0.8rem;
    }

    /* ===========================
       OPEN TO / LOOKING FOR SIDEBARS
    =========================== */
    .sidebar-section {
      margin-top: 2rem;
    }

    .sidebar-label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }

    .sidebar-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-list li {
      font-size: 0.9rem;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sidebar-list li::before {
      content: '•';
      color: var(--accent);
      font-size: 1.2rem;
      line-height: 1;
    }

    /* ===========================
       SKILLS SECTION
    =========================== */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .skill-group h3 {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 0.3rem 0.75rem;
      border-radius: 2px;
      font-size: 0.82rem;
      color: var(--text);
    }

    /* ===========================
       EXPERIENCE / EDUCATION
    =========================== */
    .exp-card, .edu-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .exp-header, .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .exp-title, .edu-degree {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .exp-company, .edu-institution {
      font-size: 0.9rem;
      color: var(--accent);
    }

    .exp-duration, .edu-year {
      font-size: 0.8rem;
      color: var(--muted);
      white-space: nowrap;
    }

    .exp-desc, .edu-gpa {
      font-size: 0.92rem;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .exp-highlights, .proj-highlights {
      list-style: none;
      padding-left: 0;
      margin-top: 0.5rem;
    }

    .exp-highlights li, .proj-highlights li {
      font-size: 0.88rem;
      color: var(--muted);
      padding-left: 1rem;
      position: relative;
      margin-bottom: 0.3rem;
    }

    .exp-highlights li::before, .proj-highlights li::before {
      content: '–';
      position: absolute;
      left: 0;
      color: var(--accent);
    }

    .edu-relevant {
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 0.5rem;
    }

    /* ===========================
       PROJECTS
    =========================== */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .proj-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 1.5rem;
    }

    .proj-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .proj-name {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      font-weight: 700;
    }

    .proj-link {
      font-size: 0.8rem;
      color: var(--accent);
      white-space: nowrap;
    }

    .proj-desc {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    .proj-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }

    .tech-tag {
      background: transparent;
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 0.2rem 0.55rem;
      border-radius: 2px;
      font-size: 0.75rem;
    }

    /* ===========================
       CERTIFICATIONS & ACHIEVEMENTS
    =========================== */
    .cert-item {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.92rem;
    }

    .cert-item:last-child { border-bottom: none; }

    .cert-issuer { color: var(--muted); }

    .cert-year {
      float: right;
      font-size: 0.8rem;
      color: var(--muted);
    }

    .achievements-list {
      list-style: none;
    }

    .achievements-list li {
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.92rem;
      color: var(--muted);
      padding-left: 1.2rem;
      position: relative;
    }

    .achievements-list li::before {
      content: '★';
      position: absolute;
      left: 0;
      color: var(--accent);
      font-size: 0.7rem;
      top: 0.75rem;
    }

    /* ===========================
       CTA / CONTACT SECTION
    =========================== */
    #contact {
      text-align: center;
      padding: 7rem 0;
    }

    .cta-main {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 6vw, 3.5rem);
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 2rem;
    }

    .cta-accent {
      color: var(--accent);
    }

    .contact-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .contact-link {
      font-size: 0.9rem;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 2px;
    }

    .contact-link:hover {
      color: var(--accent);
      text-decoration: none;
      border-color: var(--accent);
    }

    /* ===========================
       FOOTER
    =========================== */
    footer {
      text-align: center;
      padding: 2rem 0;
      font-size: 0.8rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }

    /* ===========================
       RESPONSIVE
    =========================== */
    @media (max-width: 768px) {
      .hero-name { font-size: clamp(3rem, 15vw, 5rem); }
      .nav-links { display: none; }
      .about-grid { grid-template-columns: 1fr; }
      .projects-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav>
    <div class="container nav-inner">
      <span class="nav-name">${firstName}</span>
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        ${safeArr(skills.technical) || safeArr(skills.tools) ? '<li><a href="#skills">Skills</a></li>' : ""}
        ${safeArr(resumeData.experience) ? '<li><a href="#experience">Experience</a></li>' : ""}
        ${safeArr(resumeData.projects) ? '<li><a href="#projects">Projects</a></li>' : ""}
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- HERO -->
  <section id="hero">
    <div class="container">
      <div class="hero-eyebrow">
        <span>${title}</span>
      </div>
      <h1 class="hero-name">${firstName}</h1>
      <p class="hero-tagline">
        ${taglineMain} <em>${taglineLast}</em>
      </p>
      ${summary ? `<p class="hero-summary">${summary}</p>` : ""}
      <div class="hero-links">
        ${renderContactLinks(info)}
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section id="about">
    <div class="container">
      <p class="section-label">About</p>
      <div class="about-grid">
        <div class="about-text">
          ${summary ? `<p>${summary}</p>` : ""}
          ${
            highlights
              ? `
          <ul class="highlights-list" style="margin-top: 1.5rem;">
            ${renderList(highlights)}
          </ul>
          `
              : ""
          }
        </div>
        <div>
          ${
            openTo
              ? `
          <div class="sidebar-section">
            <p class="sidebar-label">Open To</p>
            <ul class="sidebar-list">
              ${renderList(openTo)}
            </ul>
          </div>
          `
              : ""
          }
          ${
            lookingFor
              ? `
          <div class="sidebar-section" style="margin-top: 2rem;">
            <p class="sidebar-label">Looking For</p>
            <ul class="sidebar-list">
              ${renderList(lookingFor)}
            </ul>
          </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  </section>

  <!-- SKILLS -->
  ${
    safeArr(skills.technical) ||
    safeArr(skills.tools) ||
    safeArr(skills.domain) ||
    safeArr(skills.soft)
      ? `
  <section id="skills">
    <div class="container">
      <p class="section-label">Skills & Expertise</p>
      <h2 class="section-title">What I bring.</h2>
      <div class="skills-grid">
        ${
          safeArr(skills.technical)
            ? `
        <div class="skill-group">
          <h3>Technical</h3>
          <div class="skill-tags">${renderTags(skills.technical)}</div>
        </div>
        `
            : ""
        }
        ${
          safeArr(skills.tools)
            ? `
        <div class="skill-group">
          <h3>Tools & Software</h3>
          <div class="skill-tags">${renderTags(skills.tools)}</div>
        </div>
        `
            : ""
        }
        ${
          safeArr(skills.domain)
            ? `
        <div class="skill-group">
          <h3>Domain Knowledge</h3>
          <div class="skill-tags">${renderTags(skills.domain)}</div>
        </div>
        `
            : ""
        }
        ${
          safeArr(skills.soft)
            ? `
        <div class="skill-group">
          <h3>Soft Skills</h3>
          <div class="skill-tags">${renderTags(skills.soft)}</div>
        </div>
        `
            : ""
        }
      </div>
    </div>
  </section>
  `
      : ""
  }

  <!-- EXPERIENCE -->
  ${
    safeArr(resumeData.experience)
      ? `
  <section id="experience">
    <div class="container">
      <p class="section-label">Experience</p>
      <h2 class="section-title">Where I've worked.</h2>
      ${renderExperience(resumeData.experience)}
    </div>
  </section>
  `
      : ""
  }

  <!-- EDUCATION -->
  ${
    safeArr(resumeData.education)
      ? `
  <section id="education">
    <div class="container">
      <p class="section-label">Education</p>
      <h2 class="section-title">Academic background.</h2>
      ${renderEducation(resumeData.education)}
    </div>
  </section>
  `
      : ""
  }

  <!-- PROJECTS -->
  ${
    safeArr(resumeData.projects)
      ? `
  <section id="projects">
    <div class="container">
      <p class="section-label">Projects</p>
      <h2 class="section-title">What I've built.</h2>
      <div class="projects-grid">
        ${renderProjects(resumeData.projects)}
      </div>
    </div>
  </section>
  `
      : ""
  }

  <!-- CERTIFICATIONS -->
  ${
    safeArr(resumeData.certifications)
      ? `
  <section id="certifications">
    <div class="container">
      <p class="section-label">Certifications</p>
      <h2 class="section-title">Credentials.</h2>
      ${renderCerts(resumeData.certifications)}
    </div>
  </section>
  `
      : ""
  }

  <!-- ACHIEVEMENTS -->
  ${
    safeArr(resumeData.achievements)
      ? `
  <section id="achievements">
    <div class="container">
      <p class="section-label">Achievements</p>
      <h2 class="section-title">Recognition & milestones.</h2>
      <ul class="achievements-list">
        ${renderList(resumeData.achievements)}
      </ul>
    </div>
  </section>
  `
      : ""
  }

  <!-- CONTACT / CTA -->
  <section id="contact">
    <div class="container">
      <p class="section-label">Get In Touch</p>
      <h2 class="cta-main">
        ${ctaMain} <span class="cta-accent">${ctaAccent}</span>
      </h2>
      <div class="contact-links">
        ${renderContactLinks(info)}
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>© ${new Date().getFullYear()} ${name}. Built with PortfolioForge.</p>
    </div>
  </footer>

</body>
</html>`;
}

module.exports = { generatePortfolioHTML };
