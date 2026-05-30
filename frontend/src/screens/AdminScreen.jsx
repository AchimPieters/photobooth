import React, { useState, useRef, useEffect } from 'react'
import { getSettings, saveSettings, verifyPassword, hashPassword } from '../utils/settings'
import { getConfig } from '../utils/config'
import { getLicenseInfo, verifyAndParseLicense, saveLicense, removeLicense, getRawLicense } from '../utils/license'
import { formatDate, t } from '../utils/i18n'
import { useLang } from '../context/LangContext'
import { buildTemplateGuide } from '../utils/photoStrip'

// Maximale opslag voor een geüploade template (localStorage is ~5MB).
const MAX_TEMPLATE_BYTES = 3.5 * 1024 * 1024

// Eigen tweetalige teksten voor de event-template-sectie (de centrale
// i18n-tabel wordt hier bewust niet voor gebruikt).
const TPL = {
  nl: {
    title: 'Event-template (overlay)',
    help: 'PNG met transparantie, 300 dpi. De template wordt bovenop de fotostrip geprint; decoratie/iconen mogen deels over de foto’s vallen. Houd het MIN-kader vrij (gezichten); tot het MAX-kader mag je vullen. Download eerst de gids — die opent op exact de juiste maat @ 300 dpi.',
    guide: '⬇ Download ontwerpgids',
    upload: 'Template kiezen…',
    replace: 'Andere template kiezen…',
    remove: 'Verwijderen',
    none: 'Geen template ingesteld',
    opacity: 'Template-dekking',
    tooBig: 'Bestand te groot om op te slaan. Gebruik een kleinere/gecomprimeerde PNG.',
    badType: 'Kies een PNG-bestand (met transparantie).',
  },
  en: {
    title: 'Event template (overlay)',
    help: 'PNG with transparency, 300 dpi. The template is printed on top of the photo strip; decorations/icons may partly overlap the photos. Keep the MIN frame clear (faces); you may fill up to the MAX frame. Download the guide first — it opens at the exact size @ 300 dpi.',
    guide: '⬇ Download design guide',
    upload: 'Choose template…',
    replace: 'Choose another template…',
    remove: 'Remove',
    none: 'No template set',
    opacity: 'Template opacity',
    tooBig: 'File too large to store. Use a smaller/compressed PNG.',
    badType: 'Please choose a PNG file (with transparency).',
  },
}

// ─── TAALSWITCH ──────────────────────────────────────────────────────────────

function LangSwitch({ lang, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button style={{ ...s.langBtn, ...(lang === 'nl' ? s.langActive : {}) }} onClick={() => onChange('nl')}>🇳🇱</button>
      <button style={{ ...s.langBtn, ...(lang === 'en' ? s.langActive : {}) }} onClick={() => onChange('en')}>🇬🇧</button>
    </div>
  )
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess, onClose, lang, onChangeLang }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  const login = async () => {
    setBusy(true)
    const ok = await verifyPassword(pw)
    setBusy(false)
    if (ok) onSuccess()
    else setErr(true)
  }

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <span style={s.topTitle}>Admin</span>
        <LangSwitch lang={lang} onChange={onChangeLang} />
      </div>
      <div style={s.loginWrap}>
        <div style={s.lockIcon}>🔒</div>
        <h2 style={s.loginTitle}>{t('adm.login.title', lang)}</h2>
        <input
          style={{ ...s.input, ...(err ? s.inputErr : {}) }}
          type="password" placeholder={t('adm.login.pw', lang)}
          value={pw} autoComplete="current-password"
          onChange={e => { setPw(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && !busy && login()}
        />
        {err && <p style={s.errMsg}>{t('adm.login.wrong', lang)}</p>}
        <button style={s.loginBtn} onClick={login} disabled={busy}>
          {busy ? t('adm.login.checking', lang) : t('adm.login.btn', lang)}
        </button>
        <p style={s.hint}>{t('adm.login.hint', lang)}</p>
      </div>
    </div>
  )
}

// ─── LICENTIE-SECTIE ─────────────────────────────────────────────────────────

function LicenseSection({ lang }) {
  const [licInfo,    setLicInfo]  = useState(null)
  const [licLoading, setLoading]  = useState(true)
  const [licInput,   setLicInput] = useState(getRawLicense())
  const [licMsg,     setLicMsg]   = useState(null)  // { ok, text }

  useEffect(() => {
    let cancelled = false
    getLicenseInfo().then(info => {
      if (!cancelled) { setLicInfo(info); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  const activate = async () => {
    // Verwijder ALLE witruimte (inclusief interne newlines bij copy-paste uit GitHub Actions)
    const raw = licInput.replace(/\s+/g, '')
    if (!raw) {
      removeLicense(); setLicInfo(null)
      setLicMsg({ ok: true, text: t('adm.lic.removed', lang) }); return
    }
    const payload = await verifyAndParseLicense(raw)
    if (!payload) { setLicMsg({ ok: false, text: t('adm.lic.invalid', lang) }); return }
    if (new Date(payload.expires + 'T23:59:59Z') < new Date()) { setLicMsg({ ok: false, text: t('adm.lic.expired', lang, { date: formatDate(payload.expires) }) }); return }
    saveLicense(raw)
    const info = await getLicenseInfo()
    setLicInfo(info)
    setLicMsg({ ok: true, text: t('adm.lic.activated', lang, { name: payload.licensee, date: formatDate(payload.expires) }) })
  }

  const deactivate = () => {
    removeLicense(); setLicInfo(null); setLicInput('')
    setLicMsg({ ok: true, text: t('adm.lic.removed', lang) })
  }

  if (licLoading) return null

  const badge = licInfo?.valid
    ? { bg: 'rgba(39,174,96,0.15)',    color: '#27ae60', text: t('adm.lic.valid', lang, { name: licInfo.licensee, date: formatDate(licInfo.expires) }) }
    : licInfo?.reason === 'expired'
      ? { bg: 'rgba(233,69,96,0.1)',   color: '#e94560', text: t('adm.lic.exp_badge', lang, { date: formatDate(licInfo.expires) }) }
      : { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', text: t('adm.lic.none', lang) }

  return (
    <>
      <div style={{ ...s.badge, background: badge.bg, color: badge.color }}>
        {badge.text}
      </div>

      <Section title={t('adm.lic.section', lang)}>
        <Field label={t('adm.lic.label', lang)}>
          <textarea
            style={{ ...s.input, minHeight: 88, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            value={licInput}
            onChange={e => { setLicInput(e.target.value); setLicMsg(null) }}
            placeholder="pb_eyJ..."
            spellCheck={false}
          />
        </Field>
        {licMsg && (
          <p style={{ ...s.errMsg, color: licMsg.ok ? '#27ae60' : '#e94560', marginBottom: 10 }}>
            {licMsg.text}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ ...s.smBtn, flex: 1 }} onClick={activate}>{t('adm.lic.activate', lang)}</button>
          {licInfo?.valid && (
            <button style={{ ...s.smBtn, background: 'rgba(233,69,96,0.15)', color: '#e94560' }} onClick={deactivate}>
              {t('adm.lic.remove', lang)}
            </button>
          )}
        </div>
      </Section>
    </>
  )
}

// ─── MAIN ADMIN SCREEN ───────────────────────────────────────────────────────

export default function AdminScreen({ onClose }) {
  const [phase, setPhase] = useState('login')
  const [saved,     setSaved]     = useState(false)
  const [pwError,   setPwError]   = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const savedTimer = useRef(null)

  // Initialiseer vanuit de context (= taal die de gebruiker koos op WelcomeScreen)
  const contextLang = useLang()
  const [lang, setLang] = useState(contextLang)
  const changeLang = (l) => { setLang(l); saveSettings({ language: l }) }

  const [form, setForm] = useState(() => {
    const c = getConfig()
    const s = getSettings()
    return {
      sumupAffiliateKey: c.sumupAffiliateKey,
      price:             String(c.price),
      passportPrice:     String(c.passportPrice),
      currency:          c.currency,
      baseUrl:           c.baseUrl,
      totalPhotos:       String(c.totalPhotos),
      countdownSecs:     String(c.countdownSecs),
      autoRestartSecs:    String(c.autoRestartSecs),
      inactivityResetSecs: String(c.inactivityResetSecs),
      stripFooter:       c.stripFooter,
      stripBg:           c.stripBg,
      stripTemplate:        c.stripTemplate || '',
      stripTemplateOpacity: c.stripTemplateOpacity ?? 1,
      _passwordHash:     s.passwordHash,
    }
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const tpl = TPL[lang] || TPL.nl
  const fileRef = useRef(null)
  const [tplErr, setTplErr] = useState('')

  const onTemplateFile = (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = '' // zelfde bestand opnieuw kiezen toestaan
    if (!file) return
    setTplErr('')
    if (file.type !== 'image/png') { setTplErr(tpl.badType); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (dataUrl.length > MAX_TEMPLATE_BYTES) { setTplErr(tpl.tooBig); return }
      set('stripTemplate', dataUrl)
    }
    reader.onerror = () => setTplErr(tpl.badType)
    reader.readAsDataURL(file)
  }

  const downloadGuide = () => {
    const url = buildTemplateGuide({
      photoCount: Math.max(1, Math.min(8, parseInt(form.totalPhotos) || 4)),
    })
    const a = document.createElement('a')
    a.href = url
    a.download = 'photobooth-template-gids-300dpi.png'
    a.click()
  }

  const save = async () => {
    setPwError('')
    let passwordHash = form._passwordHash
    if (newPw) {
      if (newPw !== confirmPw) { setPwError(t('adm.pw.mismatch', lang)); return }
      if (newPw.length < 6)    { setPwError(t('adm.pw.tooshort', lang)); return }
      passwordHash = await hashPassword(newPw)
    }
    saveSettings({
      sumupAffiliateKey: form.sumupAffiliateKey.trim(),
      price:             Number(form.price) || 0,
      passportPrice:     Number(form.passportPrice) || 0,
      currency:          form.currency.trim().toUpperCase() || 'EUR',
      baseUrl:           form.baseUrl.trim(),
      totalPhotos:       Math.max(1, Math.min(8,   parseInt(form.totalPhotos)    || 4)),
      countdownSecs:     Math.max(1, Math.min(10,  parseInt(form.countdownSecs)  || 3)),
      autoRestartSecs:    Math.max(5,  Math.min(120, parseInt(form.autoRestartSecs)    || 15)),
      inactivityResetSecs: Math.max(10, Math.min(300, parseInt(form.inactivityResetSecs) || 30)),
      stripFooter:       form.stripFooter,
      stripBg:           form.stripBg,
      stripTemplate:        form.stripTemplate,
      stripTemplateOpacity: form.stripTemplateOpacity,
      passwordHash,
    })
    setNewPw(''); setConfirmPw('')
    clearTimeout(savedTimer.current)
    setSaved(true)
    savedTimer.current = setTimeout(() => setSaved(false), 2500)
  }

  if (phase === 'login') {
    return <LoginScreen onSuccess={() => setPhase('settings')} onClose={onClose} lang={lang} onChangeLang={changeLang} />
  }

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <span style={s.topTitle}>{t('adm.title', lang)}</span>
        <LangSwitch lang={lang} onChange={changeLang} />
      </div>

      <div style={s.scroll}>

        {/* ── Licenties ── */}
        <LicenseSection lang={lang} />

        {/* ── Betaling ── */}
        <Section title={t('adm.pay.section', lang)}>
          <Field label={t('adm.pay.key', lang)}>
            <input style={s.input} type="text" value={form.sumupAffiliateKey}
              onChange={e => set('sumupAffiliateKey', e.target.value)}
              placeholder={t('adm.pay.key_ph', lang)} autoComplete="off" />
          </Field>
          <Field label={t('adm.pay.price', lang)}>
            <input style={s.input} type="number" step="0.01" min="0"
              value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label={t('adm.pay.passport', lang)}>
            <input style={s.input} type="number" step="0.01" min="0"
              value={form.passportPrice} onChange={e => set('passportPrice', e.target.value)} />
          </Field>
          <Field label={t('adm.pay.currency', lang)}>
            <input style={s.input} type="text" maxLength={3}
              value={form.currency} onChange={e => set('currency', e.target.value)} />
          </Field>
          <Field label={t('adm.pay.url', lang)}>
            <input style={s.input} type="url"
              value={form.baseUrl} onChange={e => set('baseUrl', e.target.value)}
              placeholder="https://achimpieters.github.io/photobooth" />
          </Field>
        </Section>

        {/* ── Fotobooth ── */}
        <Section title={t('adm.booth.section', lang)}>
          <Field label={t('adm.booth.photos', lang)}>
            <input style={s.input} type="number" min="1" max="8"
              value={form.totalPhotos} onChange={e => set('totalPhotos', e.target.value)} />
          </Field>
          <Field label={t('adm.booth.countdown', lang)}>
            <input style={s.input} type="number" min="1" max="10"
              value={form.countdownSecs} onChange={e => set('countdownSecs', e.target.value)} />
          </Field>
          <Field label={t('adm.booth.restart', lang)}>
            <input style={s.input} type="number" min="5" max="120"
              value={form.autoRestartSecs} onChange={e => set('autoRestartSecs', e.target.value)} />
          </Field>
          <Field label={t('adm.booth.idle', lang)}>
            <input style={s.input} type="number" min="10" max="300"
              value={form.inactivityResetSecs} onChange={e => set('inactivityResetSecs', e.target.value)} />
          </Field>
        </Section>

        {/* ── Fotostrip ── */}
        <Section title={t('adm.strip.section', lang)}>
          <Field label={t('adm.strip.footer', lang)}>
            <input style={s.input} type="text"
              value={form.stripFooter} onChange={e => set('stripFooter', e.target.value)} />
          </Field>
          <Field label={t('adm.strip.bg', lang)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="color" value={form.stripBg}
                onChange={e => set('stripBg', e.target.value)} style={s.colorPicker} />
              <input style={{ ...s.input, flex: 1 }} type="text"
                value={form.stripBg} onChange={e => set('stripBg', e.target.value)} />
            </div>
          </Field>

          {/* ── Event-template (overlay) ── */}
          <Field label={tpl.title}>
            <p style={s.tplHelp}>{tpl.help}</p>

            <button style={s.tplGuideBtn} onClick={downloadGuide}>{tpl.guide}</button>

            {form.stripTemplate
              ? (
                <div style={s.tplPreviewWrap}>
                  <img src={form.stripTemplate} alt="template" style={s.tplPreview} />
                </div>
              )
              : <p style={{ ...s.hint, marginTop: 10 }}>{tpl.none}</p>
            }

            {tplErr && <p style={s.errMsg}>{tplErr}</p>}

            <input ref={fileRef} type="file" accept="image/png"
              onChange={onTemplateFile} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button style={{ ...s.smBtn, flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()}>
                {form.stripTemplate ? tpl.replace : tpl.upload}
              </button>
              {form.stripTemplate && (
                <button style={{ ...s.smBtn, background: 'rgba(233,69,96,0.15)', color: '#e94560' }}
                  onClick={() => { set('stripTemplate', ''); setTplErr('') }}>
                  {tpl.remove}
                </button>
              )}
            </div>

            {form.stripTemplate && (
              <div style={{ marginTop: 16 }}>
                <p style={s.label}>{tpl.opacity} — {Math.round((form.stripTemplateOpacity ?? 1) * 100)}%</p>
                <input type="range" min="0" max="100" style={{ width: '100%' }}
                  value={Math.round((form.stripTemplateOpacity ?? 1) * 100)}
                  onChange={e => set('stripTemplateOpacity', Number(e.target.value) / 100)} />
              </div>
            )}
          </Field>
        </Section>

        {/* ── Wachtwoord ── */}
        <Section title={t('adm.pw.section', lang)}>
          <Field label={t('adm.pw.new', lang)}>
            <input style={s.input} type="password" value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwError('') }}
              placeholder={t('adm.pw.new_ph', lang)} autoComplete="new-password" />
          </Field>
          <Field label={t('adm.pw.confirm', lang)}>
            <input style={s.input} type="password" value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
              placeholder={t('adm.pw.confirm_ph', lang)} autoComplete="new-password" />
          </Field>
          {pwError && <p style={s.errMsg}>{pwError}</p>}
        </Section>

        <button style={saved ? s.savedBtn : s.saveBtn} onClick={save}>
          {saved ? t('adm.saved', lang) : t('adm.save', lang)}
        </button>
        <div style={{ height: 50 }} />
      </div>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={s.field}>
      <p style={s.label}>{label}</p>
      {children}
    </div>
  )
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  root: {
    position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 200,
    background: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    display: 'flex', flexDirection: 'column', overflowY: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0', flexShrink: 0,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontSize: 22, fontWeight: 700 },
  langBtn: { padding: '6px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 600 },
  langActive: { background: 'rgba(255,255,255,0.2)', color: '#fff' },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 24px', WebkitOverflowScrolling: 'touch' },
  loginWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 40px' },
  lockIcon: { fontSize: 64 },
  loginTitle: { color: '#fff', fontSize: 32, fontWeight: 700 },
  loginBtn: { width: '100%', padding: '20px', borderRadius: 16, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 600, marginBottom: 24, lineHeight: 1.4 },
  section: { marginBottom: 28 },
  sectionTitle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 6 },
  input: { width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 16, boxSizing: 'border-box', outline: 'none' },
  inputErr: { borderColor: '#e94560' },
  errMsg: { color: '#e94560', fontSize: 14, marginTop: 2 },
  colorPicker: { width: 56, height: 44, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.08)' },
  smBtn: { padding: '14px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 600 },
  tplHelp: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' },
  tplGuideBtn: { width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(29,161,242,0.18)', color: '#1da1f2', fontSize: 15, fontWeight: 700 },
  tplPreviewWrap: { marginTop: 12, display: 'flex', justifyContent: 'center', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.06)', backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.08) 25%,transparent 25%),linear-gradient(-45deg,rgba(255,255,255,0.08) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(255,255,255,0.08) 75%),linear-gradient(-45deg,transparent 75%,rgba(255,255,255,0.08) 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0' },
  tplPreview: { maxWidth: 140, maxHeight: 220, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' },
  codeBox: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', lineHeight: 1.6 },
  saveBtn: { width: '100%', padding: '22px', borderRadius: 16, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 20, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)', marginTop: 8 },
  savedBtn: { width: '100%', padding: '22px', borderRadius: 16, background: 'linear-gradient(90deg,#27ae60,#1e8449)', color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 },
}
