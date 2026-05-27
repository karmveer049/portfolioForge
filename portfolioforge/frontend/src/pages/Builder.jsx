import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import {
  Upload, Sparkles, CheckCircle, ChevronRight, ChevronLeft,
  Plus, Trash2, Loader2, User, Link2, GraduationCap, Code2,
  FolderOpen, Briefcase, Award, Palette, AlertCircle, Zap
} from 'lucide-react'
import api from '../lib/api'

/* ── Field wrapper ── */
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">
        {typeof label === 'string' ? label : <span>{label}</span>}
      </label>
      {children}
      {hint && <p className="font-sans text-xs text-[#C9A87C] mt-1">{hint}</p>}
    </div>
  )
}
const Input = ({ reg, placeholder, type = 'text' }) =>
  <input {...reg} type={type} placeholder={placeholder} className="input-ed" />
const Textarea = ({ reg, placeholder, rows = 3 }) =>
  <textarea {...reg} placeholder={placeholder} rows={rows} className="input-ed resize-none leading-relaxed" />
function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 font-mono-k text-[9px] px-1.5 py-0.5 rounded-sm amber-tag ml-2">
      <Sparkles size={9} /> AI
    </span>
  )
}
function AIBtn({ onClick, loading, label = 'Re-improve with AI' }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 font-sans text-xs text-[#A06B10] hover:text-[#D4922A] transition-colors mt-1.5 disabled:opacity-50">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />} {label}
    </button>
  )
}

/* ════════════════════════════════════════
   PHASE 0 — RESUME UPLOAD
════════════════════════════════════════ */
function ResumeUpload({ onParsed }) {
  const [drag, setDrag]   = useState(false)
  const [file, setFile]   = useState(null)
  const [stage, setStage] = useState('idle')
  const [err, setErr]     = useState('')
  const ref = useRef(null)

  const LABELS = { uploading:'Uploading…', parsing:'Extracting information…', enhancing:'AI enhancing content…', done:'Done!' }

  const run = async (f) => {
    if (!f) return
    setFile(f); setErr('')
    const ok = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!ok.includes(f.type)) { setErr('Only PDF or DOCX accepted.'); return }
    if (f.size > 10*1024*1024) { setErr('Max 10 MB.'); return }
    try {
      setStage('uploading'); await new Promise(r=>setTimeout(r,300))
      setStage('parsing')
      const fd = new FormData(); fd.append('resume', f)
      const res = await api.post('/resume/parse', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setStage('enhancing'); await new Promise(r=>setTimeout(r,500))
      setStage('done');      await new Promise(r=>setTimeout(r,400))
      onParsed(res.data.data, res.data.resumeUrl)
    } catch(e) {
      setStage('error'); setErr(e.response?.data?.message || 'Parsing failed. Try again.')
    }
  }

  const busy = ['uploading','parsing','enhancing','done'].includes(stage)
  const stages = ['uploading','parsing','enhancing','done']
  const si = stages.indexOf(stage)

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col">
      <nav className="border-b border-[#E8DDD0] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-lg text-[#1C1410]">Portfolio<span className="text-[#D4922A]">Forge</span></Link>
          <Link to="/dashboard" className="font-sans text-xs text-[#A8896A] hover:text-[#1C1410] transition-colors">← Dashboard</Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="text-center mb-10">
              <div className={`inline-flex w-16 h-16 rounded-full items-center justify-center mb-5`}
                style={{ background:'rgba(212,146,42,0.1)', border:'1px solid rgba(212,146,42,0.3)' }}>
                {busy ? <Loader2 size={26} className="text-[#D4922A] animate-spin" /> : <Sparkles size={26} className="text-[#D4922A]" />}
              </div>
              <h1 className="font-serif text-4xl text-[#1C1410] mb-3">Upload your resume.</h1>
              <p className="font-sans text-[#7A6248] font-light">AI reads your CV and fills your entire portfolio form automatically.</p>
            </div>

            {!busy && (
              <div
                className={`card-ed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${drag ? 'border-[#D4922A]' : ''}`}
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);run(e.dataTransfer.files[0])}}
                onClick={()=>ref.current?.click()}
              >
                <input ref={ref} type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e=>run(e.target.files[0])} />
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                  style={{ background:'linear-gradient(90deg,transparent,rgba(212,146,42,0.4),transparent)' }} />
                <Upload size={32} className="mx-auto mb-4 text-[#C9A87C]" />
                <p className="font-sans font-medium text-[#1C1410] mb-1">{file ? file.name : 'Drop your resume here'}</p>
                <p className="font-sans text-sm text-[#A8896A] font-light">or click to browse · PDF or DOCX · max 10 MB</p>
                {err && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <p className="font-sans text-xs text-red-600">{err}</p>
                  </div>
                )}
              </div>
            )}

            {busy && (
              <div className="card-ed rounded-xl p-8 space-y-4">
                {stages.map((s,i)=>{
                  const done=i<si, active=i===si
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        s==='done'&&active?'bg-[#E0F0E8] border border-[#4A8A5A]':
                        done?'bg-[#FFF3D0] border border-[#D4922A]':
                        active?'bg-[#F0E8DA] border-2 border-[#D4922A]':
                        'bg-[#F0E8DA] border border-[#DDD0BC]'}`}>
                        {s==='done'&&active?<CheckCircle size={13} className="text-[#4A8A5A]"/>:
                         done?<CheckCircle size={13} className="text-[#D4922A]"/>:
                         active?<Loader2 size={13} className="text-[#D4922A] animate-spin"/>:
                         <div className="w-2 h-2 rounded-full bg-[#DDD0BC]"/>}
                      </div>
                      <span className={`font-sans text-sm ${active||done?'text-[#1C1410]':'text-[#C9A87C]'}`}>{LABELS[s]}</span>
                    </div>
                  )
                })}
                <div className="h-1.5 bg-[#F0E8DA] rounded-full overflow-hidden mt-4">
                  <motion.div className="h-full bg-[#D4922A] rounded-full"
                    animate={{ width: si===0?'20%':si===1?'50%':si===2?'80%':'100%' }}
                    transition={{ duration:0.5 }} />
                </div>
              </div>
            )}

            {!busy && (
              <p className="text-center mt-6 font-sans text-xs text-[#A8896A]">
                No resume? <button onClick={()=>onParsed(null,null)}
                  className="text-[#D4922A] hover:text-[#A06B10] underline">Fill manually</button>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   PHASE 1 — CONFIDENCE REVIEW
════════════════════════════════════════ */
function ConfidenceReview({ parsed, onContinue }) {
  const score = parsed?.confidence || 0
  const color = score>=80?'#4A8A5A':score>=50?'#D4922A':'#C0604A'
  const sections = [
    { label:'Personal info',  filled:!!(parsed?.personal?.name&&parsed?.personal?.email) },
    { label:'Education',      filled:!!(parsed?.academics?.college) },
    { label:'Skills',         filled:!!(parsed?.skills?.languages?.length) },
    { label:'Projects',       filled:!!(parsed?.projects?.length) },
    { label:'Experience',     filled:!!(parsed?.experience?.length) },
    { label:'Certifications', filled:!!(parsed?.certifications?.length) },
    { label:'Achievements',   filled:!!(parsed?.achievements?.length) },
    { label:'About / Bio',    filled:!!(parsed?.about) },
    { label:'Tagline',        filled:!!(parsed?.personal?.tagline) },
  ]
  const filledCount = sections.filter(s=>s.filled).length
  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col">
      <nav className="border-b border-[#E8DDD0] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="font-serif text-lg text-[#1C1410]">Portfolio<span className="text-[#D4922A]">Forge</span></Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="text-center mb-8">
              <div className="font-mono-k text-xs text-[#D4922A] tracking-widest uppercase mb-3">Resume Analyzed</div>
              <h2 className="font-serif text-4xl text-[#1C1410] mb-2">Here's what we found.</h2>
              <p className="font-sans text-[#7A6248] font-light">Review the extraction, then edit anything that needs fixing.</p>
            </div>
            <div className="card-ed rounded-xl p-7 mb-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background:`linear-gradient(90deg,transparent,${color}60,transparent)` }} />
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#F0E8DA" strokeWidth="6"/>
                    <motion.circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={`${2*Math.PI*34}`}
                      initial={{ strokeDashoffset:2*Math.PI*34 }}
                      animate={{ strokeDashoffset:2*Math.PI*34*(1-score/100) }}
                      transition={{ duration:1.2, ease:'easeOut' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-xl" style={{ color }}>{score}%</span>
                  </div>
                </div>
                <div>
                  <div className="font-sans font-semibold text-[#1C1410] mb-1">
                    {score>=80?'Excellent extraction':score>=50?'Good extraction':'Partial extraction'}
                  </div>
                  <div className="font-sans text-sm text-[#7A6248] font-light">
                    {filledCount} of {sections.length} sections auto-filled
                  </div>
                  {parsed?.missingFields?.length>0 && (
                    <div className="font-sans text-xs text-[#A8896A] mt-1">
                      Missing: {parsed.missingFields.slice(0,3).join(', ')}
                      {parsed.missingFields.length>3&&` +${parsed.missingFields.length-3} more`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sections.map(s=>(
                  <span key={s.label} className={`inline-flex items-center gap-1.5 font-sans text-xs px-2.5 py-1 rounded-sm ${
                    s.filled?'bg-[#E8F4EC] border border-[#4A8A5A]/30 text-[#4A8A5A]':
                    'bg-[#F0E8DA] border border-[#DDD0BC] text-[#A8896A]'}`}>
                    {s.filled?<CheckCircle size={10}/>:<AlertCircle size={10}/>} {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-sm mb-6 flex items-start gap-3"
              style={{ background:'rgba(212,146,42,0.06)', border:'1px solid rgba(212,146,42,0.2)' }}>
              <Zap size={14} className="text-[#D4922A] flex-shrink-0 mt-0.5"/>
              <p className="font-sans text-xs text-[#7A6248] font-light leading-relaxed">
                <strong className="text-[#A06B10]">AI enhancements applied:</strong> Bio generated or improved, tagline created, weak project descriptions rewritten, skills categorized automatically.
              </p>
            </div>
            <button onClick={onContinue} className="btn-primary w-full justify-center py-3.5">
              Review & edit my details <ChevronRight size={14}/>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   FORM STEP COMPONENTS
════════════════════════════════════════ */
function PersonalStep({ form, aiFields=[] }) {
  const { register, setValue, getValues } = form
  const [imp, setImp] = useState(false)
  const improve = async () => {
    const bio = getValues('about'); if (!bio?.trim()) return toast.error('Write a draft first')
    setImp(true)
    try { const r=await api.post('/ai/improve-bio',{bio}); setValue('about',r.data.improved); toast.success('Bio improved!') }
    catch { toast.error('AI failed') } finally { setImp(false) }
  }
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Full name *"><Input reg={register('name',{required:true})} placeholder="Karmveer Kumar"/></Field>
        <Field label={<>Tagline * {aiFields.includes('tagline')&&<AIBadge/>}</>}>
          <Input reg={register('tagline',{required:true})} placeholder="Full-Stack Developer & AI Builder"/>
        </Field>
      </div>
      <Field label={<>About / Bio * {aiFields.includes('about')&&<AIBadge/>}</>}>
        <Textarea reg={register('about',{required:true})} placeholder="Your professional bio..." rows={5}/>
        <AIBtn onClick={improve} loading={imp} label="Re-improve bio with AI"/>
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Email *"><Input reg={register('email',{required:true})} type="email" placeholder="you@gmail.com"/></Field>
        <Field label="Phone"><Input reg={register('phone')} placeholder="+91 99999 99999"/></Field>
        <Field label="Location"><Input reg={register('location')} placeholder="Hamirpur, HP"/></Field>
        <Field label="Resume URL" hint="Auto-uploaded from your CV"><Input reg={register('resumeUrl')} placeholder="Cloudinary URL"/></Field>
      </div>
    </div>
  )
}

function SocialStep({ form }) {
  const { register } = form
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {[
        {k:'github',    l:'GitHub',    p:'https://github.com/username'},
        {k:'linkedin',  l:'LinkedIn',  p:'https://linkedin.com/in/username'},
        {k:'twitter',   l:'Twitter/X', p:'https://x.com/username'},
        {k:'leetcode',  l:'LeetCode',  p:'https://leetcode.com/username'},
        {k:'kaggle',    l:'Kaggle',    p:'https://kaggle.com/username'},
        {k:'portfolio', l:'Other',     p:'https://yoursite.com'},
      ].map(s=>(
        <Field key={s.k} label={s.l}><Input reg={form.register(`socials.${s.k}`)} placeholder={s.p}/></Field>
      ))}
    </div>
  )
}

function AcademicsStep({ form }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {[
        {k:'college', l:'College *', p:'NIT Hamirpur'},
        {k:'degree',  l:'Degree *',  p:'B.Tech Electrical Engineering'},
        {k:'cgpa',    l:'CGPA',      p:'9.07 / 10'},
        {k:'gradYear',l:'Grad year', p:'2027'},
        {k:'tenth',   l:'10th %',    p:'95%'},
        {k:'twelfth', l:'12th %',    p:'93%'},
      ].map(f=>(
        <Field key={f.k} label={f.l}><Input reg={form.register(`academics.${f.k}`)} placeholder={f.p}/></Field>
      ))}
    </div>
  )
}

function SkillsStep({ form }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {[
        {k:'languages', l:'Languages',  p:'Python, JavaScript, C++'},
        {k:'frameworks',l:'Frameworks', p:'React, FastAPI, Flask'},
        {k:'databases', l:'Databases',  p:'MySQL, MongoDB'},
        {k:'tools',     l:'Tools',      p:'Git, Docker, Postman'},
        {k:'ai',        l:'AI / ML',    p:'Whisper, Gemini API'},
      ].map(s=>(
        <Field key={s.k} label={s.l}><Input reg={form.register(`skills.${s.k}`)} placeholder={s.p}/></Field>
      ))}
    </div>
  )
}

function ProjectsStep({ form }) {
  const { register, control, setValue, getValues } = form
  const { fields, append, remove } = useFieldArray({ control, name:'projects' })
  const [imp, setImp] = useState({})
  const improve = async (idx) => {
    const desc = getValues(`projects.${idx}.description`); if (!desc?.trim()) return toast.error('Add description first')
    setImp(p=>({...p,[idx]:true}))
    try { const r=await api.post('/ai/improve-project',{description:desc}); setValue(`projects.${idx}.description`,r.data.improved); toast.success('Improved!') }
    catch { toast.error('AI failed') } finally { setImp(p=>({...p,[idx]:false})) }
  }
  return (
    <div className="space-y-5">
      {fields.map((f,i)=>(
        <div key={f.id} className="card-ed rounded-lg p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4922A]/40 to-transparent rounded-t-lg"/>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-k text-xs text-[#D4922A]">Project {String(i+1).padStart(2,'0')}</span>
            {fields.length>1&&<button type="button" onClick={()=>remove(i)} className="text-[#A8896A] hover:text-red-500"><Trash2 size={13}/></button>}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-3">
            <Field label="Title *"><Input reg={register(`projects.${i}.title`)} placeholder="AI Transcriber"/></Field>
            <Field label="Highlight"><Input reg={register(`projects.${i}.highlight`)} placeholder="Sub-2s latency"/></Field>
          </div>
          <Field label="Description">
            <Textarea reg={register(`projects.${i}.description`)} placeholder="What you built..." rows={3}/>
            <AIBtn onClick={()=>improve(i)} loading={imp[i]}/>
          </Field>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <Field label="Stack (comma-separated)"><Input reg={register(`projects.${i}.stack`)} placeholder="FastAPI, React"/></Field>
            <Field label="Live URL"><Input reg={register(`projects.${i}.liveUrl`)} placeholder="https://..."/></Field>
            <Field label="GitHub URL"><Input reg={register(`projects.${i}.githubUrl`)} placeholder="https://github.com/..."/></Field>
            <Field label="Screenshot URL"><Input reg={register(`projects.${i}.screenshot`)} placeholder="https://..."/></Field>
          </div>
        </div>
      ))}
      <button type="button" onClick={()=>append({title:'',description:'',stack:'',liveUrl:'',githubUrl:'',screenshot:'',highlight:''})}
        className="btn-secondary w-full justify-center py-3"><Plus size={13}/> Add project</button>
    </div>
  )
}

function ExperienceStep({ form }) {
  const { register, control } = form
  const { fields, append, remove } = useFieldArray({ control, name:'experience' })
  return (
    <div className="space-y-5">
      {fields.map((f,i)=>(
        <div key={f.id} className="card-ed rounded-lg p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A87C]/40 to-transparent rounded-t-lg"/>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-k text-xs text-[#D4922A]">Experience {i+1}</span>
            <button type="button" onClick={()=>remove(i)} className="text-[#A8896A] hover:text-red-500"><Trash2 size={13}/></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Role *"><Input reg={register(`experience.${i}.role`)} placeholder="ML Intern"/></Field>
            <Field label="Company *"><Input reg={register(`experience.${i}.company`)} placeholder="CodSoft"/></Field>
            <Field label="Start date"><Input reg={register(`experience.${i}.startDate`)} placeholder="Jul 2025"/></Field>
            <Field label="End date"><Input reg={register(`experience.${i}.endDate`)} placeholder="Aug 2025"/></Field>
            <Field label="Type"><Input reg={register(`experience.${i}.type`)} placeholder="Remote"/></Field>
            <Field label="Tech"><Input reg={register(`experience.${i}.tech`)} placeholder="Python, Pandas"/></Field>
          </div>
          <div className="mt-3">
            <Field label="Description"><Textarea reg={register(`experience.${i}.description`)} placeholder="What you did..."/></Field>
          </div>
        </div>
      ))}
      <button type="button" onClick={()=>append({role:'',company:'',startDate:'',endDate:'',type:'',description:'',tech:''})}
        className="btn-secondary w-full justify-center py-3"><Plus size={13}/> Add experience</button>
    </div>
  )
}

function AchievementsStep({ form }) {
  const { register, control } = form
  const certs   = useFieldArray({ control, name:'certifications' })
  const achieve = useFieldArray({ control, name:'achievements' })
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl text-[#1C1410] mb-4">Certifications</h3>
        <div className="space-y-3">
          {certs.fields.map((f,i)=>(
            <div key={f.id} className="grid md:grid-cols-3 gap-3 p-4 card-ed rounded-sm relative">
              <button type="button" onClick={()=>certs.remove(i)} className="absolute top-3 right-3 text-[#A8896A] hover:text-red-500"><Trash2 size={11}/></button>
              <Field label="Title"><Input reg={register(`certifications.${i}.title`)} placeholder="ML Internship"/></Field>
              <Field label="Org"><Input reg={register(`certifications.${i}.org`)} placeholder="CodSoft"/></Field>
              <Field label="URL"><Input reg={register(`certifications.${i}.url`)} placeholder="https://..."/></Field>
            </div>
          ))}
          <button type="button" onClick={()=>certs.append({title:'',org:'',url:''})} className="btn-secondary py-2 px-4 text-sm"><Plus size={12}/> Add</button>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-xl text-[#1C1410] mb-4">Achievements</h3>
        <div className="space-y-3">
          {achieve.fields.map((f,i)=>(
            <div key={f.id} className="grid md:grid-cols-2 gap-3 p-4 card-ed rounded-sm relative">
              <button type="button" onClick={()=>achieve.remove(i)} className="absolute top-3 right-3 text-[#A8896A] hover:text-red-500"><Trash2 size={11}/></button>
              <Field label="Achievement"><Input reg={register(`achievements.${i}.title`)} placeholder="GATE 2026 Qualified"/></Field>
              <Field label="Details"><Input reg={register(`achievements.${i}.desc`)} placeholder="Details..."/></Field>
            </div>
          ))}
          <button type="button" onClick={()=>achieve.append({title:'',desc:''})} className="btn-secondary py-2 px-4 text-sm"><Plus size={12}/> Add</button>
        </div>
      </div>
    </div>
  )
}

const THEMES = [
  { id:'soft-editorial', label:'Soft Editorial', bg:'#F7F3ED', accent:'#D4922A', preview:'Off-white + charcoal' },
  { id:'warm-library',   label:'Warm Library',   bg:'#1C1410', accent:'#D4922A', preview:'Dark walnut + amber' },
  { id:'espresso',       label:'Espresso',       bg:'#0D0804', accent:'#C9933A', preview:'Deep dark + caramel' },
  { id:'studio-journal', label:'Studio Journal', bg:'#F7F2EA', accent:'#7A5C3A', preview:'Parchment + mocha' },
]

function CustomizeStep({ form }) {
  const { register, watch, setValue } = form
  const theme = watch('theme') || 'soft-editorial'
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl text-[#1C1410] mb-5">Theme</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {THEMES.map(t=>(
            <button key={t.id} type="button" onClick={()=>setValue('theme',t.id)}
              className={`relative p-5 rounded-lg border-2 text-left transition-all ${theme===t.id?'border-[#D4922A] shadow-md':'border-transparent card-ed'}`}>
              {theme===t.id&&<CheckCircle size={14} className="absolute top-3 right-3 text-[#D4922A]"/>}
              <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-sm" style={{background:t.bg,border:'1px solid rgba(0,0,0,0.1)'}}/>
                <div className="w-8 h-8 rounded-sm" style={{background:t.accent}}/>
              </div>
              <div className="font-sans font-medium text-[#1C1410] text-sm">{t.label}</div>
              <div className="font-sans text-xs text-[#A8896A] mt-0.5">{t.preview}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-3">Animation intensity</label>
          <input type="range" min="1" max="3" step="1" {...register('animationIntensity')} className="w-full accent-[#D4922A]"/>
          <div className="flex justify-between font-sans text-xs text-[#C9A87C] mt-1"><span>Minimal</span><span>Balanced</span><span>Cinematic</span></div>
        </div>
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-3">Font style</label>
          <select {...register('fontStyle')} className="input-ed">
            <option value="serif-sans">Editorial (DM Serif + Jakarta Sans)</option>
            <option value="all-sans">Modern sans-serif</option>
          </select>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   PARSED DATA → FORM DEFAULTS
════════════════════════════════════════ */
function toDefaults(p) {
  if (!p) return {}
  return {
    name:      p.personal?.name      || '',
    tagline:   p.personal?.tagline   || '',
    about:     p.about               || '',
    email:     p.personal?.email     || '',
    phone:     p.personal?.phone     || '',
    location:  p.personal?.location  || '',
    resumeUrl: p.resumeUrl           || '',
    socials: {
      github:    p.socials?.github    || '',
      linkedin:  p.socials?.linkedin  || '',
      twitter:   p.socials?.twitter   || '',
      leetcode:  p.socials?.leetcode  || '',
      kaggle:    p.socials?.kaggle    || '',
      portfolio: p.socials?.portfolio || '',
    },
    academics: {
      college:  p.academics?.college  || '',
      degree:   p.academics?.degree   || '',
      cgpa:     p.academics?.cgpa     || '',
      gradYear: p.academics?.gradYear || '',
      tenth:    p.academics?.tenth    || '',
      twelfth:  p.academics?.twelfth  || '',
    },
    skills: {
      languages:  (p.skills?.languages  ||[]).join(', '),
      frameworks: (p.skills?.frameworks ||[]).join(', '),
      databases:  (p.skills?.databases  ||[]).join(', '),
      tools:      (p.skills?.tools      ||[]).join(', '),
      ai:         (p.skills?.ai         ||[]).join(', '),
    },
    projects: p.projects?.length
      ? p.projects.map(x=>({ title:x.title||'', description:x.description||'',
          stack: Array.isArray(x.stack)?x.stack.join(', '):(x.stack||''),
          liveUrl:x.liveUrl||'', githubUrl:x.githubUrl||'', screenshot:x.screenshot||'', highlight:x.highlight||'' }))
      : [{ title:'', description:'', stack:'', liveUrl:'', githubUrl:'', screenshot:'', highlight:'' }],
    experience: (p.experience||[]).map(x=>({ role:x.role||'', company:x.company||'',
      startDate:x.startDate||'', endDate:x.endDate||'', type:x.type||'', description:x.description||'',
      tech: Array.isArray(x.tech)?x.tech.join(', '):(x.tech||'') })),
    certifications: (p.certifications||[]).map(x=>({ title:x.title||'', org:x.org||'', url:x.url||'' })),
    achievements:   (p.achievements||[]).map(x=>({ title:x.title||'', desc:x.desc||'' })),
    theme:              p.suggestedTheme || 'soft-editorial',
    animationIntensity: '2',
    fontStyle:          'serif-sans',
  }
}

/* ════════════════════════════════════════
   MAIN BUILDER COMPONENT
════════════════════════════════════════ */
const STEPS = [
  { id:'personal',     label:'Personal',    icon:User },
  { id:'social',       label:'Social',      icon:Link2 },
  { id:'academics',    label:'Academics',   icon:GraduationCap },
  { id:'skills',       label:'Skills',      icon:Code2 },
  { id:'projects',     label:'Projects',    icon:FolderOpen },
  { id:'experience',   label:'Experience',  icon:Briefcase },
  { id:'achievements', label:'Achievements',icon:Award },
  { id:'customize',    label:'Customize',   icon:Palette },
]

export default function Builder() {
  const [phase,    setPhase]    = useState('upload')
  const [parsed,   setParsed]   = useState(null)
  const [aiFields, setAiFields] = useState([])
  const [step,     setStep]     = useState(0)
  const [busy,     setBusy]     = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      projects:[{title:'',description:'',stack:'',liveUrl:'',githubUrl:'',screenshot:'',highlight:''}],
      experience:[], certifications:[], achievements:[],
      theme:'soft-editorial', animationIntensity:'2', fontStyle:'serif-sans',
    }
  })

  const handleParsed = (data, resumeUrl) => {
    if (!data) { setPhase('form'); return }
    setParsed(data)
    const gen = []
    if (!data.about||data.about.length<60) gen.push('about')
    if (!data.personal?.tagline) gen.push('tagline')
    setAiFields(gen)
    form.reset(toDefaults({ ...data, resumeUrl }))
    setPhase('review')
  }

  const onSubmit = async (data) => {
    setBusy(true)
    try {
      const res = await api.post('/portfolio/generate', data)
      toast.success('Portfolio generation started!')
      navigate(`/portfolio/${res.data.portfolioId}/status`)
    } catch(e) {
      toast.error(e.response?.data?.message || 'Generation failed')
    } finally { setBusy(false) }
  }

  if (phase === 'upload') return <ResumeUpload onParsed={handleParsed} />
  if (phase === 'review') return <ConfidenceReview parsed={parsed} onContinue={()=>setPhase('form')} />

  const stepComponents = [
    <PersonalStep form={form} aiFields={aiFields}/>,
    <SocialStep form={form}/>,
    <AcademicsStep form={form}/>,
    <SkillsStep form={form}/>,
    <ProjectsStep form={form}/>,
    <ExperienceStep form={form}/>,
    <AchievementsStep form={form}/>,
    <CustomizeStep form={form}/>,
  ]
  const Icon = STEPS[step].icon

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3ED]/95 backdrop-blur-sm border-b border-[#E8DDD0]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="font-serif text-lg text-[#1C1410]">Portfolio<span className="text-[#D4922A]">Forge</span></span>
              {parsed && (
                <span className="inline-flex items-center gap-1 font-mono-k text-[9px] px-2 py-0.5 amber-tag rounded-sm">
                  <Sparkles size={9}/> AI pre-filled
                </span>
              )}
            </div>
            <span className="font-mono-k text-xs text-[#A8896A]">Step {step+1} of {STEPS.length}</span>
          </div>
          <div className="w-full h-1 bg-[#E8DDD0] rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#D4922A] rounded-full"
              animate={{ width:`${((step+1)/STEPS.length)*100}%` }} transition={{ duration:0.4 }}/>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="flex gap-2 flex-wrap mb-10">
          {STEPS.map((s,i)=>{
            const SI = s.icon
            return (
              <button key={s.id} onClick={()=>setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-xs transition-all ${
                  i===step?'bg-[#1C1410] text-[#F7F3ED]':
                  i<step?'bg-[#D4922A]/15 text-[#A06B10] border border-[#D4922A]/30':
                  'text-[#A8896A] hover:text-[#7A6248]'}`}>
                {i<step?<CheckCircle size={10}/>:<SI size={11}/>} {s.label}
              </button>
            )
          })}
        </div>

        <motion.div key={step} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm bg-[#F0E8DA] border border-[#DDD0BC] flex items-center justify-center">
              <Icon size={14} className="text-[#D4922A]"/>
            </div>
            <h2 className="font-serif text-3xl text-[#1C1410]">{STEPS[step].label}</h2>
          </div>
          <div className="ink-line mb-8 max-w-24"/>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            {stepComponents[step]}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E8DDD0]">
              <button type="button"
                onClick={()=>step===0?setPhase('review'):setStep(s=>s-1)}
                className="btn-secondary">
                <ChevronLeft size={14}/> {step===0?'Back to review':'Back'}
              </button>
              {step<STEPS.length-1 ? (
                <button type="button" onClick={()=>setStep(s=>s+1)} className="btn-primary">
                  Next <ChevronRight size={14}/>
                </button>
              ) : (
                <motion.button type="submit" disabled={busy}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  className="btn-primary px-8 disabled:opacity-60">
                  {busy?<><Loader2 size={14} className="animate-spin"/> Generating…</>
                      :<><Sparkles size={14}/> Generate my portfolio</>}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
