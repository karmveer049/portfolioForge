const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { extractResumeData } = require("../services/geminiService");
const { generatePortfolioHTML } = require("../utils/portfolioGenerator");
const { deployToGitHubPages } = require("../services/githubService"); // keep existing

const router = express.Router();

// Multer config — accept PDF only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `resume-${unique}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are accepted."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/portfolio/generate
 * Accepts a resume PDF, parses it with Gemini, generates portfolio HTML.
 * Returns the HTML string and parsed resume data.
 */
router.post("/generate", upload.single("resume"), async (req, res) => {
  let pdfPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    pdfPath = req.file.path;
    console.log(`[PortfolioForge] Processing resume: ${pdfPath}`);

    // Step 1: Extract structured data from PDF via Gemini
    console.log("[PortfolioForge] Calling Gemini for resume extraction...");
    const resumeData = await extractResumeData(pdfPath);
    console.log(`[PortfolioForge] Extracted profile type: ${resumeData.profileType}`);
    console.log(`[PortfolioForge] Professional title: ${resumeData.professionalTitle}`);

    // Step 2: Generate portfolio HTML from extracted data
    console.log("[PortfolioForge] Generating portfolio HTML...");
    const portfolioHTML = generatePortfolioHTML(resumeData);

    // Step 3: Cleanup uploaded PDF
    fs.unlinkSync(pdfPath);
    pdfPath = null;

    return res.status(200).json({
      success: true,
      resumeData,
      portfolioHTML,
    });
  } catch (err) {
    console.error("[PortfolioForge] Generation error:", err.message);

    // Cleanup on error
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    return res.status(500).json({
      error: "Portfolio generation failed.",
      details: err.message,
    });
  }
});

/**
 * POST /api/portfolio/deploy
 * Accepts portfolioHTML + resumeData + GitHub credentials, deploys to GitHub Pages.
 * Keeps existing deploy logic — only passes through the dynamic data.
 */
router.post("/deploy", async (req, res) => {
  try {
    const { portfolioHTML, resumeData, githubToken, repoName } = req.body;

    if (!portfolioHTML || !githubToken || !repoName) {
      return res.status(400).json({ error: "Missing required fields: portfolioHTML, githubToken, repoName" });
    }

    console.log("[PortfolioForge] Deploying to GitHub Pages...");
    const deployResult = await deployToGitHubPages({
      html: portfolioHTML,
      token: githubToken,
      repoName,
      ownerName: resumeData?.personalInfo?.name || "portfolio",
    });

    return res.status(200).json({
      success: true,
      url: deployResult.url,
      repo: deployResult.repo,
    });
  } catch (err) {
    console.error("[PortfolioForge] Deploy error:", err.message);
    return res.status(500).json({
      error: "Deployment failed.",
      details: err.message,
    });
  }
});

module.exports = router;
