import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM = `"PortfolioForge" <${process.env.SMTP_USER}>`

function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin:0; padding:0; background:#F7F3ED; font-family:'Helvetica Neue',Arial,sans-serif; }
    .wrapper { max-width:560px; margin:40px auto; background:#FFFCF7; border:1px solid rgba(201,168,124,0.35); border-radius:8px; overflow:hidden; }
    .header { background:#1C1410; padding:28px 36px; }
    .header h1 { margin:0; font-size:22px; color:#F7F3ED; font-weight:400; letter-spacing:-0.3px; }
    .header span { color:#D4922A; }
    .body { padding:32px 36px; }
    .body p { margin:0 0 16px; font-size:15px; color:#7A6248; line-height:1.6; }
    .body h2 { font-size:24px; color:#1C1410; font-weight:400; margin:0 0 20px; }
    .btn { display:inline-block; padding:12px 28px; background:#D4922A; color:#1C1410; text-decoration:none; border-radius:4px; font-weight:600; font-size:14px; margin:16px 0; }
    .url-box { background:#F0E8DA; border:1px solid #DDD0BC; border-radius:4px; padding:12px 16px; font-family:monospace; font-size:13px; color:#1C1410; word-break:break-all; margin:12px 0; }
    .footer { background:#F0E8DA; padding:20px 36px; border-top:1px solid #E8DDD0; }
    .footer p { margin:0; font-size:12px; color:#A8896A; }
    .divider { height:1px; background:linear-gradient(90deg,transparent,#C9A87C,transparent); margin:20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Portfolio<span>Forge</span></h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} PortfolioForge · You're receiving this because you signed up.</p>
    </div>
  </div>
</body>
</html>`
}

/* Welcome email */
export async function sendWelcomeEmail(user) {
  const transport = createTransport()
  await transport.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Welcome to PortfolioForge 🎉',
    html: baseTemplate(`
      <h2>Welcome, ${user.name.split(' ')[0]}.</h2>
      <p>Your PortfolioForge account is ready. You can now generate a premium animated portfolio website in minutes.</p>
      <p>Just fill in your details, choose a theme, and we'll handle the rest — code generation, GitHub push, and deployment.</p>
      <a href="${process.env.FRONTEND_URL}/builder" class="btn">Build my portfolio →</a>
      <div class="divider"></div>
      <p style="font-size:13px">If you didn't create this account, you can safely ignore this email.</p>
    `),
  })
}

/* Portfolio live email */
export async function sendPortfolioLiveEmail(user, portfolio) {
  const transport = createTransport()
  await transport.sendMail({
    from: FROM,
    to: user.email,
    subject: '🚀 Your portfolio is live!',
    html: baseTemplate(`
      <h2>Your portfolio is live.</h2>
      <p>Hey ${user.name.split(' ')[0]}, your PortfolioForge portfolio has been generated and deployed successfully.</p>
      <p><strong>Your live URL:</strong></p>
      <div class="url-box">${portfolio.deployedUrl}</div>
      <a href="${portfolio.deployedUrl}" class="btn">View my portfolio →</a>
      ${portfolio.githubRepoUrl ? `
        <div class="divider"></div>
        <p><strong>GitHub repository:</strong></p>
        <div class="url-box">${portfolio.githubRepoUrl}</div>
      ` : ''}
      <div class="divider"></div>
      <p style="font-size:13px">Share your portfolio with recruiters, startup founders, and freelance clients. Good luck!</p>
    `),
  })
}

/* Portfolio generation failure email */
export async function sendGenerationFailedEmail(user, portfolioId) {
  const transport = createTransport()
  await transport.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Portfolio generation failed — we\'re looking into it',
    html: baseTemplate(`
      <h2>Generation failed.</h2>
      <p>Hey ${user.name.split(' ')[0]}, unfortunately your portfolio generation encountered an error.</p>
      <p>Our team has been notified and will resolve this shortly. You can also try generating again from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to dashboard →</a>
      <div class="divider"></div>
      <p style="font-size:13px">Portfolio ID: <code>${portfolioId}</code></p>
    `),
  })
}

/* Password reset email */
export async function sendPasswordResetEmail(user, token) {
  const transport = createTransport()
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await transport.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Reset your PortfolioForge password',
    html: baseTemplate(`
      <h2>Reset your password.</h2>
      <p>We received a request to reset the password for your PortfolioForge account.</p>
      <a href="${link}" class="btn">Reset password →</a>
      <p style="font-size:13px;margin-top:16px">This link expires in 1 hour. If you didn't request a password reset, ignore this email.</p>
    `),
  })
}
