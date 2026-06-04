/**
   Copyright 2026 Achim Pieters | StudioPieters®

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   for more information visit https://www.studiopieters.nl
 **/

import React, { useState, useRef, useEffect } from 'react'
import { getSettings, saveSettings, verifyPassword, hashPassword } from '../utils/settings'
import { getConfig } from '../utils/config'
import { getLicenseInfo, verifyAndParseLicense, saveLicense, removeLicense, getRawLicense } from '../utils/license'
import { formatDate, t } from '../utils/i18n'
import { useLang } from '../context/LangContext'
import { buildTemplateGuide, buildPrintSheet } from '../utils/photoStrip'
import { passportCount } from '../utils/passportStrip'
import { PAPERS, DEFAULT_PAPER, paperLabel, stripPhotoCount } from '../utils/papers'

// Maximale opslag voor een geüploade overlay (localStorage is ~5MB).
const MAX_TEMPLATE_BYTES = 3.5 * 1024 * 1024

// Officiële ontwerp-templates (InDesign, met 3 mm bleed + cyan/magenta kaders)
// in de repo-map Templates/ — bedoeld voor grafisch vormgevers om mee te werken.
const REPO_TEMPLATES_BASE = 'https://github.com/AchimPieters/photobooth/blob/main/Templates/'
const OFFICIAL_TEMPLATE_FILE = {
  L: 'L-formaat 89x119mm.indd',
  postcard: 'Postcard 10x15 cm (4x6").indd',
  card: 'Card 54x86.indd',
}
function officialTemplateUrl(paper) {
  const name = OFFICIAL_TEMPLATE_FILE[paper]
  return name ? REPO_TEMPLATES_BASE + encodeURIComponent(name) : null
}

const uid = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function newTemplate(product) {
  if (product === 'passport') {
    return { id: uid(), name: 'Pasfoto', product: 'passport', paper: 'postcard', photoCount: passportCount('postcard') }
  }
  return {
    id: uid(), name: 'Strip', product: 'strip', paper: DEFAULT_PAPER,
    photoCount: stripPhotoCount(DEFAULT_PAPER), footer: '', bg: '#000000',
    overlay: null, overlayOpacity: 1, designedFor: null,
  }
}

// Genereert een gekleurde voorbeeldfoto (SVG data-URL) voor de live preview.
function dummyPhoto(i, total) {
  const hue = Math.round((i / Math.max(1, total)) * 320)
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>` +
    `<rect width='100%' height='100%' fill='hsl(${hue},45%,55%)'/>` +
    `<text x='50%' y='50%' font-size='150' fill='rgba(255,255,255,0.65)' ` +
    `text-anchor='middle' dominant-baseline='central' font-family='sans-serif'>${i + 1}</text>` +
    `</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

// Tweetalige teksten voor de template-manager (de centrale i18n-tabel wordt
// hier bewust niet voor gebruikt).
const TPL = {
  nl: {
    section: '🎞️ Templates',
    intro: 'Een template bepaalt wat de klant krijgt. Kies per product één ACTIEVE template (✓) — dát krijgt de klant bij Fotostrip of Pasfoto’s. Tik een kaartje om het te bewerken.',
    groupStrip: '🎞️ Fotostrip',
    groupPassport: '🪪 Pasfoto’s',
    activePill: 'ACTIEF',
    activeSub: 'dit krijgt de klant',
    makeActive: 'Maak actief',
    photos: 'foto’s',
    editingHeading: 'Template bewerken',
    newStrip: '+ Nieuwe strip-template',
    newPassport: '+ Nieuwe pasfoto-template',
    name: 'Naam',
    paper: 'Papierformaat',
    countStripFixed: 'Aantal foto’s ligt vast voor dit papier: {n}',
    countPassport: "Aantal foto's",
    countPassportHint: 'Past op dit vel: max {n}',
    del: 'Verwijder template',
    delMin: 'Minstens één template per product vereist.',
    pStrip: 'Fotostrip',
    pPassport: "Pasfoto's",
    footer: 'Footer tekst',
    bg: 'Achtergrondkleur',
    overlay: 'Event-overlay (PNG)',
    overlayHelp: 'PNG met transparantie, 300 dpi, bovenop de strip geprint. Download de ontwerpgids (exacte maat + aantal vakken) en houd het MIN-kader vrij voor gezichten.',
    guide: '⬇ Download ontwerpgids',
    official: '⬇ Officiële template (InDesign, 3 mm bleed)',
    upload: 'Overlay kiezen…',
    replace: 'Andere overlay kiezen…',
    remove: 'Overlay verwijderen',
    opacity: 'Overlay-dekking',
    tooBig: 'Bestand te groot. Gebruik een kleinere/gecomprimeerde PNG.',
    badType: 'Kies een PNG-bestand (met transparantie).',
    preview_with: 'Live voorbeeld — overlay over voorbeeldfoto’s',
    preview_none: 'Live voorbeeld — nog geen overlay (alleen de strip)',
    match_ok: '✓ Overlay past bij papier + aantal + footer',
    match_bad: '⚠️ Overlay wijkt af van waarvoor hij is gemaakt — bij het printen wordt hij weggelaten:',
    diff_footer_on: 'gemaakt zónder footer, maar de footer staat nu aan',
    diff_footer_off: 'gemaakt mét footer, maar de footer staat nu uit',
    diff_count: "aantal foto's",
    meta_unknown: 'Ontwerp-parameters onbekend — controleer of de overlay nog past.',
    mark_ok: 'Toch toepassen — markeer als passend',
    printersTitle: '🖨️ Printers',
    printersHintOne: 'Eén printer telt voor beide producten met het gekozen papier. Voeg een tweede toe om fotostrip en pasfoto’s aan een eigen printer te koppelen.',
    printersHintMulti: 'Koppel per product hieronder de juiste printer (met zijn papier).',
    addPrinter: '+ Printer toevoegen',
    removePrinter: 'Printer verwijderen',
    printOn: 'Print op',
    show: 'Tonen in frontend',
  },
  en: {
    section: '🎞️ Templates',
    intro: 'A template defines what the customer gets. Pick one ACTIVE template (✓) per product — that’s what the customer gets for Photo strip or Passport. Tap a card to edit it.',
    groupStrip: '🎞️ Photo strip',
    groupPassport: '🪪 Passport',
    activePill: 'ACTIVE',
    activeSub: 'this is what the customer gets',
    makeActive: 'Set active',
    photos: 'photos',
    editingHeading: 'Edit template',
    newStrip: '+ New strip template',
    newPassport: '+ New passport template',
    name: 'Name',
    paper: 'Paper size',
    countStripFixed: 'Number of photos is fixed for this paper: {n}',
    countPassport: 'Number of photos',
    countPassportHint: 'Fits on this sheet: max {n}',
    del: 'Delete template',
    delMin: 'At least one template per product is required.',
    pStrip: 'Photo strip',
    pPassport: 'Passport',
    footer: 'Footer text',
    bg: 'Background colour',
    overlay: 'Event overlay (PNG)',
    overlayHelp: 'PNG with transparency, 300 dpi, printed on top of the strip. Download the design guide (exact size + cells) and keep the MIN frame clear for faces.',
    guide: '⬇ Download design guide',
    official: '⬇ Official template (InDesign, 3 mm bleed)',
    upload: 'Choose overlay…',
    replace: 'Choose another overlay…',
    remove: 'Remove overlay',
    opacity: 'Overlay opacity',
    tooBig: 'File too large. Use a smaller/compressed PNG.',
    badType: 'Please choose a PNG file (with transparency).',
    preview_with: 'Live preview — overlay over sample photos',
    preview_none: 'Live preview — no overlay yet (strip only)',
    match_ok: '✓ Overlay matches paper + count + footer',
    match_bad: '⚠️ Overlay differs from what it was made for — it will be left out when printing:',
    diff_footer_on: 'made without footer, but the footer is now on',
    diff_footer_off: 'made with footer, but the footer is now off',
    diff_count: 'number of photos',
    meta_unknown: 'Design parameters unknown — check the overlay still fits.',
    mark_ok: 'Apply anyway — mark as matching',
    printersTitle: '🖨️ Printers',
    printersHintOne: 'One printer counts for both products with the chosen paper. Add a second to assign photo strip and passport to their own printer.',
    printersHintMulti: 'Assign the right printer (with its paper) to each product below.',
    addPrinter: '+ Add printer',
    removePrinter: 'Remove printer',
    printOn: 'Prints on',
    show: 'Show in frontend',
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

// ─── TEMPLATE-MANAGER ────────────────────────────────────────────────────────

// Zet één papierformaat op álle templates van een product (papier = blokniveau).
// Strip-aantal volgt het papier; pasfoto-aantal blijft binnen de capaciteit.
function applyPaper(list, product, paper) {
  return list.map(t => {
    if (t.product !== product) return t
    if (product === 'strip') return { ...t, paper, photoCount: stripPhotoCount(paper) }
    return { ...t, paper, photoCount: Math.min(t.photoCount || passportCount(paper), passportCount(paper)) }
  })
}

// Herstel de invarianten na een printer-wijziging: bij één printer geldt die
// voor beide producten, en het papier per product wordt opnieuw uit de
// gekoppelde printer afgeleid (papier = printer-eigenschap).
function reflowPrinters(f) {
  let { printers, stripPrinterId, passportPrinterId } = f
  if (!printers.length) printers = [{ id: 'printer-1', name: 'Printer 1', paper: DEFAULT_PAPER }]
  if (printers.length === 1) {
    stripPrinterId = passportPrinterId = printers[0].id
  } else {
    if (!printers.some(p => p.id === stripPrinterId)) stripPrinterId = printers[0].id
    if (!printers.some(p => p.id === passportPrinterId)) passportPrinterId = printers[0].id
  }
  const sp = printers.find(p => p.id === stripPrinterId) || printers[0]
  const pp = printers.find(p => p.id === passportPrinterId) || printers[0]
  let templates = applyPaper(f.templates, 'strip', sp.paper)
  templates = applyPaper(templates, 'passport', pp.paper)
  return { ...f, printers, stripPrinterId, passportPrinterId, templates }
}

function TemplateManager({ form, setForm, lang }) {
  const tpl = TPL[lang] || TPL.nl
  const printers = form.printers || []
  const multi = printers.length > 1

  // Een printer toevoegen. De tweede koppelt zich meteen aan de pasfoto (en krijgt
  // postcard als papier), zodat "fotostrip + pasfoto apart" direct zichtbaar is.
  const addPrinter = () => setForm(f => {
    const n = f.printers.length + 1
    const np = { id: uid(), name: `Printer ${n}`, paper: n === 2 ? 'postcard' : DEFAULT_PAPER }
    const passportPrinterId = f.printers.length === 1 ? np.id : f.passportPrinterId
    return reflowPrinters({ ...f, printers: [...f.printers, np], passportPrinterId })
  })

  const removePrinter = (id) => setForm(f => {
    if (f.printers.length <= 1) return f
    return reflowPrinters({ ...f, printers: f.printers.filter(p => p.id !== id) })
  })

  const renamePrinter = (id, name) =>
    setForm(f => ({ ...f, printers: f.printers.map(p => p.id === id ? { ...p, name } : p) }))

  const setPrinterPaper = (id, paper) =>
    setForm(f => reflowPrinters({ ...f, printers: f.printers.map(p => p.id === id ? { ...p, paper } : p) }))

  // Koppel een product aan een printer (alleen zinvol bij ≥2 printers).
  const assignPrinter = (product, printerId) => setForm(f => reflowPrinters({
    ...f, [product === 'strip' ? 'stripPrinterId' : 'passportPrinterId']: printerId,
  }))

  // Een product tonen/verbergen in de frontend; minstens één blijft aan.
  const setEnabled = (product, on) => setForm(f => {
    const stripOn = product === 'strip' ? on : f.stripEnabled !== false
    const passOn  = product === 'passport' ? on : f.passportEnabled !== false
    if (!stripOn && !passOn) return f
    return { ...f, [product === 'strip' ? 'stripEnabled' : 'passportEnabled']: on }
  })

  return (
    <Section title={tpl.section}>
      <p style={s.tplHelp}>{tpl.intro}</p>

      {/* ── Printers: elk een naam + papier; één printer geldt voor beide ── */}
      <p style={s.tplGroup}>{tpl.printersTitle}</p>
      {printers.map((p, i) => (
        <div key={p.id} style={s.printerRow}>
          <input style={{ ...s.input, flex: '2 1 110px' }} type="text" value={p.name}
            onChange={e => renamePrinter(p.id, e.target.value)} placeholder={`Printer ${i + 1}`} />
          <select style={{ ...s.input, flex: '2 1 130px' }} value={p.paper}
            onChange={e => setPrinterPaper(p.id, e.target.value)}>
            {Object.values(PAPERS).map(pp => (
              <option key={pp.id} value={pp.id}>{paperLabel(pp.id, lang)}</option>
            ))}
          </select>
          {printers.length > 1 && (
            <button style={s.printerDel} onClick={() => removePrinter(p.id)}
              title={tpl.removePrinter} aria-label={tpl.removePrinter}>✕</button>
          )}
        </div>
      ))}
      <button style={{ ...s.smBtn, width: '100%', marginTop: 4 }} onClick={addPrinter}>{tpl.addPrinter}</button>
      <p style={{ ...s.tplHelp, marginTop: 10 }}>{multi ? tpl.printersHintMulti : tpl.printersHintOne}</p>

      <ProductBlock product="strip" form={form} setForm={setForm} lang={lang}
        enabled={form.stripEnabled !== false}
        onToggle={on => setEnabled('strip', on)}
        printers={printers} multi={multi} assignedId={form.stripPrinterId}
        onAssign={id => assignPrinter('strip', id)} />

      <ProductBlock product="passport" form={form} setForm={setForm} lang={lang}
        enabled={form.passportEnabled !== false}
        onToggle={on => setEnabled('passport', on)}
        printers={printers} multi={multi} assignedId={form.passportPrinterId}
        onAssign={id => assignPrinter('passport', id)} />
    </Section>
  )
}

// Eén zelfstandig blok per product (Fotostrip / Pasfoto's): aan/uit-schakelaar,
// printer-koppeling (met diens papier), eigen template-kaarten en de editor.
function ProductBlock({ product, form, setForm, lang, enabled, onToggle, printers, multi, assignedId, onAssign }) {
  const tpl = TPL[lang] || TPL.nl
  const isStrip = product === 'strip'
  const fileRef = useRef(null)
  const [tplErr, setTplErr] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const list = form.templates.filter(t => t.product === product)
  const [sel, setSel] = useState(list[0]?.id)
  useEffect(() => { if (!list.some(t => t.id === sel)) setSel(list[0]?.id) }, [list, sel])
  const selected = list.find(t => t.id === sel) || list[0]

  const activeId    = isStrip ? form.activeStripTemplateId : form.activePassportTemplateId
  // Het papier komt van de gekoppelde printer (papier = printer-eigenschap).
  const printer     = printers.find(p => p.id === assignedId) || printers[0]
  const blockPaper  = printer?.paper || (isStrip ? DEFAULT_PAPER : 'postcard')
  const capacity    = passportCount(blockPaper)

  const patchTpl = (id, patch) =>
    setForm(f => ({ ...f, templates: f.templates.map(t => t.id === id ? { ...t, ...patch } : t) }))
  const setT = (patch) => selected && patchTpl(selected.id, patch)

  // Nieuwe template volgt meteen het papier van de gekoppelde printer.
  const addTpl = () => {
    const base = newTemplate(product)
    const t = isStrip
      ? { ...base, paper: blockPaper, photoCount: stripPhotoCount(blockPaper) }
      : { ...base, paper: blockPaper, photoCount: Math.min(base.photoCount, capacity) }
    setForm(f => ({ ...f, templates: [...f.templates, t] }))
    setSel(t.id)
    setTplErr('')
  }

  // Een template verwijderen (op id) — minstens één per product blijft over.
  const delTplById = (id) => {
    if (list.length <= 1) { setTplErr(tpl.delMin); return }
    setTplErr('')
    const fallback = list.find(t => t.id !== id)
    setForm(f => {
      const next = f.templates.filter(t => t.id !== id)
      return {
        ...f,
        templates: next,
        activeStripTemplateId:    f.activeStripTemplateId === id ? next.find(t=>t.product==='strip')?.id : f.activeStripTemplateId,
        activePassportTemplateId: f.activePassportTemplateId === id ? next.find(t=>t.product==='passport')?.id : f.activePassportTemplateId,
      }
    })
    if (sel === id) setSel(fallback?.id)
  }
  const delTpl = () => selected && delTplById(selected.id)

  // Markeer een template als de actieve voor dit product (= wat de klant krijgt).
  const setActive = (item) => setForm(f => (
    isStrip ? { ...f, activeStripTemplateId: item.id } : { ...f, activePassportTemplateId: item.id }
  ))

  // Overlay-upload (alleen strip): legt vast waarvoor de overlay is gemaakt.
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setTplErr('')
    if (file.type !== 'image/png') { setTplErr(tpl.badType); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (dataUrl.length > MAX_TEMPLATE_BYTES) { setTplErr(tpl.tooBig); return }
      setT({ overlay: dataUrl, designedFor: { photoCount: selected.photoCount, hasFooter: !!(selected.footer || '').trim() } })
    }
    reader.onerror = () => setTplErr(tpl.badType)
    reader.readAsDataURL(file)
  }
  const removeOverlay = () => { setTplErr(''); setT({ overlay: null, designedFor: null }) }

  const downloadGuide = () => {
    const url = buildTemplateGuide({
      paper: selected.paper,
      photoCount: selected.photoCount,
      hasFooter: !!(selected.footer || '').trim(),
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `photobooth-gids-${selected.paper}-${selected.photoCount}f-300dpi.png`
    a.click()
  }

  // Waarborg: past de overlay nog bij aantal + footer van deze template?
  const curFooter = !!((selected?.footer || '').trim())
  const diffs = []
  if (isStrip && selected?.overlay && selected.designedFor) {
    if (selected.designedFor.hasFooter !== curFooter) diffs.push(curFooter ? tpl.diff_footer_on : tpl.diff_footer_off)
    if (selected.designedFor.photoCount !== selected.photoCount) diffs.push(`${tpl.diff_count}: ${selected.designedFor.photoCount} → ${selected.photoCount}`)
  }
  const markOk = () => setT({ designedFor: { photoCount: selected.photoCount, hasFooter: curFooter } })

  // Live preview (alleen strip) — het VOLLEDIGE printvel (één grid-ontwerp),
  // exact wat de klant en de printer krijgen, op de juiste papierverhouding.
  useEffect(() => {
    if (!isStrip || !selected) { setPreviewUrl(null); return }
    let cancelled = false
    const photos = Array.from({ length: selected.photoCount }, (_, i) => dummyPhoto(i, selected.photoCount))
    const id = setTimeout(() => {
      buildPrintSheet(photos, {
        paper: selected.paper,
        footerText: (selected.footer || '').trim(),
        bgColor: selected.bg, overlay: selected.overlay || null,
        overlayOpacity: selected.overlayOpacity ?? 1,
      }).then(url => { if (!cancelled) setPreviewUrl(url) })
    }, 200)
    return () => { cancelled = true; clearTimeout(id) }
  }, [isStrip, selected?.paper, selected?.photoCount, selected?.footer, selected?.bg, selected?.overlay, selected?.overlayOpacity])

  // Eén kaartje per template: tik = bewerken, ✓-knop = actief maken.
  const renderCard = (x) => {
    const active  = x.id === activeId
    const editing = x.id === selected?.id
    return (
      <div key={x.id}
        style={{ ...s.tplRow, ...(editing ? s.tplRowEditing : {}) }}
        onClick={() => { setSel(x.id); setTplErr('') }}>
        <button
          style={{ ...s.tplRadio, ...(active ? s.tplRadioOn : {}) }}
          onClick={e => { e.stopPropagation(); setActive(x) }}
          title={tpl.makeActive} aria-label={tpl.makeActive}>
          {active ? '✓' : ''}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.tplRowName}>{x.name}</p>
          <p style={s.tplRowSub}>{paperLabel(x.paper, lang)} · {x.photoCount} {tpl.photos}</p>
        </div>
        {active && <span style={s.tplActivePill}>{tpl.activePill}</span>}
        {list.length > 1 && (
          <button style={s.tplCardDel} onClick={e => { e.stopPropagation(); delTplById(x.id) }}
            title={tpl.del} aria-label={tpl.del}>✕</button>
        )}
      </div>
    )
  }

  return (
    <div style={s.block}>
      {/* Kop: titel + aan/uit-schakelaar voor de frontend */}
      <div style={s.blockHeader}>
        <span style={s.blockTitle}>{isStrip ? tpl.groupStrip : tpl.groupPassport}</span>
        <label style={s.switchLabel}>
          <span style={s.switchText}>{tpl.show}</span>
          <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} />
        </label>
      </div>

      {/* Printer-koppeling: bij één printer een vaste regel, anders een keuze.
          Het papier komt altijd van de gekoppelde printer. */}
      {multi ? (
        <Field label={tpl.printOn}>
          <select style={s.input} value={printer?.id} onChange={e => onAssign(e.target.value)}>
            {printers.map(p => (
              <option key={p.id} value={p.id}>{p.name} · {paperLabel(p.paper, lang)}</option>
            ))}
          </select>
        </Field>
      ) : (
        <p style={s.tplCountFixed}>{tpl.printOn}: {printer?.name} · {paperLabel(blockPaper, lang)}</p>
      )}

      {/* Template-kaarten van dit product */}
      {list.map(renderCard)}
      <button style={{ ...s.smBtn, width: '100%', marginTop: 4, marginBottom: 12 }} onClick={addTpl}>
        {isStrip ? tpl.newStrip : tpl.newPassport}
      </button>

      {/* Editor voor het aangetikte template */}
      {selected && (
        <div style={s.printerCard}>
          <p style={{ ...s.label, marginBottom: 10, fontWeight: 700 }}>{tpl.editingHeading}</p>

          <Field label={tpl.name}>
            <input style={s.input} type="text" value={selected.name}
              onChange={e => setT({ name: e.target.value })} />
          </Field>

          {isStrip ? (
            // Strip: het aantal foto's ligt vast per papierformaat — geen los veld.
            <p style={s.tplCountFixed}>
              {tpl.countStripFixed.replace('{n}', stripPhotoCount(blockPaper))}
            </p>
          ) : (
            <Field label={tpl.countPassport}>
              <input style={s.input} type="number" min="1" max={capacity}
                value={selected.photoCount}
                onChange={e => {
                  const n = Math.max(1, Math.min(capacity, parseInt(e.target.value) || 1))
                  setT({ photoCount: n })
                }} />
              <p style={{ ...s.hint, marginTop: 4 }}>
                {tpl.countPassportHint.replace('{n}', capacity)}
              </p>
            </Field>
          )}

          {isStrip && (
            <>
              <Field label={tpl.footer}>
                <input style={s.input} type="text" value={selected.footer || ''}
                  onChange={e => setT({ footer: e.target.value })} />
              </Field>
              <Field label={tpl.bg}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="color" value={selected.bg} onChange={e => setT({ bg: e.target.value })} style={s.colorPicker} />
                  <input style={{ ...s.input, flex: 1 }} type="text" value={selected.bg} onChange={e => setT({ bg: e.target.value })} />
                </div>
              </Field>

              <Field label={tpl.overlay}>
                <p style={s.tplHelp}>{tpl.overlayHelp}</p>

                <button style={s.tplGuideBtn} onClick={downloadGuide}>{tpl.guide}</button>
                {officialTemplateUrl(blockPaper) && (
                  <a style={{ ...s.tplGuideBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                    href={officialTemplateUrl(blockPaper)} target="_blank" rel="noopener noreferrer">
                    {tpl.official}
                  </a>
                )}

                <div style={s.tplPreviewWrap}>
                  {previewUrl ? <img src={previewUrl} alt="preview" style={s.tplPreview} /> : <p style={s.hint}>…</p>}
                </div>
                <p style={{ ...s.hint, marginTop: 6, textAlign: 'center' }}>
                  {selected.overlay ? tpl.preview_with : tpl.preview_none}
                </p>

                {tplErr && <p style={s.errMsg}>{tplErr}</p>}

                <input ref={fileRef} type="file" accept="image/png" onChange={onFile} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button style={{ ...s.smBtn, flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()}>
                    {selected.overlay ? tpl.replace : tpl.upload}
                  </button>
                  {selected.overlay && (
                    <button style={{ ...s.smBtn, background: 'rgba(233,69,96,0.15)', color: '#e94560' }} onClick={removeOverlay}>
                      {tpl.remove}
                    </button>
                  )}
                </div>

                {/* Waarborg */}
                {selected.overlay && (
                  selected.designedFor
                    ? (diffs.length === 0
                        ? <p style={{ ...s.hint, color: '#27ae60', marginTop: 12 }}>{tpl.match_ok}</p>
                        : (
                          <div style={{ marginTop: 12 }}>
                            <p style={{ ...s.errMsg, marginBottom: 6 }}>{tpl.match_bad}</p>
                            <ul style={{ margin: '0 0 10px 18px', color: '#e94560', fontSize: 13, lineHeight: 1.5 }}>
                              {diffs.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                            <button style={s.smBtn} onClick={markOk}>{tpl.mark_ok}</button>
                          </div>
                        ))
                    : <p style={{ ...s.hint, marginTop: 12 }}>{tpl.meta_unknown}</p>
                )}

                {selected.overlay && (
                  <div style={{ marginTop: 16 }}>
                    <p style={s.label}>{tpl.opacity} — {Math.round((selected.overlayOpacity ?? 1) * 100)}%</p>
                    <input type="range" min="0" max="100" style={{ width: '100%' }}
                      value={Math.round((selected.overlayOpacity ?? 1) * 100)}
                      onChange={e => setT({ overlayOpacity: Number(e.target.value) / 100 })} />
                  </div>
                )}
              </Field>
            </>
          )}

          <button style={{ ...s.smBtn, background: 'rgba(233,69,96,0.15)', color: '#e94560', marginTop: 4 }} onClick={delTpl}>
            {tpl.del}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN ADMIN SCREEN ───────────────────────────────────────────────────────

export default function AdminScreen({ onClose }) {
  const [phase, setPhase] = useState('login')
  const [saved,     setSaved]     = useState(false)
  const [pwError,   setPwError]   = useState('')
  const [saveErr,   setSaveErr]   = useState('')
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
      countdownSecs:     String(c.countdownSecs),
      photoUploadUrl:    c.photoUploadUrl,
      photoUploadKey:    c.photoUploadKey,
      templates:         JSON.parse(JSON.stringify(c.templates)),
      activeStripTemplateId:    c.activeStripTemplateId,
      activePassportTemplateId: c.activePassportTemplateId,
      printers:          JSON.parse(JSON.stringify(c.printers)),
      stripPrinterId:    c.stripPrinterId,
      passportPrinterId: c.passportPrinterId,
      stripEnabled:      c.stripEnabled,
      passportEnabled:   c.passportEnabled,
      _passwordHash:     s.passwordHash,
    }
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const save = async () => {
    setPwError('')
    setSaveErr('')
    let passwordHash = form._passwordHash
    if (newPw) {
      if (newPw !== confirmPw) { setPwError(t('adm.pw.mismatch', lang)); return }
      if (newPw.length < 6)    { setPwError(t('adm.pw.tooshort', lang)); return }
      passwordHash = await hashPassword(newPw)
    }

    // Printers opschonen + de één-printer-regel: bij één printer geldt die voor
    // beide producten. Het papier per product komt van de gekoppelde printer.
    let printers = (form.printers || []).map((p, i) => ({
      id: p.id || `printer-${i + 1}`,
      name: (p.name || '').trim() || `Printer ${i + 1}`,
      paper: PAPERS[p.paper] ? p.paper : DEFAULT_PAPER,
    }))
    if (printers.length === 0) printers = [{ id: 'printer-1', name: 'Printer 1', paper: DEFAULT_PAPER }]
    let stripPrinterId = form.stripPrinterId
    let passportPrinterId = form.passportPrinterId
    if (printers.length === 1) {
      stripPrinterId = passportPrinterId = printers[0].id
    } else {
      if (!printers.some(p => p.id === stripPrinterId)) stripPrinterId = printers[0].id
      if (!printers.some(p => p.id === passportPrinterId)) passportPrinterId = printers[0].id
    }
    const stripPaper = printers.find(p => p.id === stripPrinterId).paper
    const passPaper  = printers.find(p => p.id === passportPrinterId).paper

    // Templates opschonen/valideren.
    const templates = form.templates.map(x => {
      const name = (x.name || '').trim() || (x.product === 'passport' ? 'Pasfoto' : 'Strip')
      if (x.product === 'passport') {
        const paper = passPaper
        const cap = passportCount(paper)
        return { id: x.id, name, product: 'passport', paper, photoCount: Math.max(1, Math.min(cap, parseInt(x.photoCount) || cap)) }
      }
      const paper = stripPaper
      return {
        id: x.id, name, product: 'strip', paper,
        // Strip-aantal ligt vast per papierformaat (één bron: papers.js).
        photoCount: stripPhotoCount(paper),
        footer: typeof x.footer === 'string' ? x.footer : '',
        bg: x.bg || '#000000',
        overlay: x.overlay || null,
        overlayOpacity: Math.max(0, Math.min(1, typeof x.overlayOpacity === 'number' ? x.overlayOpacity : 1)),
        designedFor: x.designedFor || null,
      }
    })

    const ok = saveSettings({
      sumupAffiliateKey: form.sumupAffiliateKey.trim(),
      price:             Number(form.price) || 0,
      passportPrice:     Number(form.passportPrice) || 0,
      countdownSecs:     Math.max(1, Math.min(10,  parseInt(form.countdownSecs)  || 3)),
      photoUploadUrl:    (form.photoUploadUrl || '').trim().replace(/\/$/, ''),
      photoUploadKey:    (form.photoUploadKey || '').trim(),
      templates,
      activeStripTemplateId:    form.activeStripTemplateId,
      activePassportTemplateId: form.activePassportTemplateId,
      printers,
      stripPrinterId,
      passportPrinterId,
      stripEnabled:      form.stripEnabled !== false,
      passportEnabled:   form.passportEnabled !== false,
      passwordHash,
    })
    if (!ok) { setSaveErr(t('adm.save_failed', lang)); return }
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
          <Field label={t('adm.pay.passport_simple', lang)}>
            <input style={s.input} type="number" step="0.01" min="0"
              value={form.passportPrice} onChange={e => set('passportPrice', e.target.value)} />
          </Field>
        </Section>

        {/* ── Templates ── */}
        <TemplateManager form={form} setForm={setForm} lang={lang} />

        {/* ── Fotobooth ── */}
        <Section title={t('adm.booth.section', lang)}>
          <Field label={t('adm.booth.countdown', lang)}>
            <input style={s.input} type="number" min="1" max="10"
              value={form.countdownSecs} onChange={e => set('countdownSecs', e.target.value)} />
          </Field>
        </Section>

        {/* ── Digitale kopie (QR) ── */}
        <Section title={t('adm.qr.section', lang)}>
          <p style={s.tplHelp}>{t('adm.qr.help', lang)}</p>
          <Field label={t('adm.qr.url', lang)}>
            <input style={s.input} type="url" value={form.photoUploadUrl}
              onChange={e => set('photoUploadUrl', e.target.value)}
              placeholder="https://photobooth-photos.<jij>.workers.dev" autoComplete="off" />
          </Field>
          <Field label={t('adm.qr.key', lang)}>
            <input style={s.input} type="text" value={form.photoUploadKey}
              onChange={e => set('photoUploadKey', e.target.value)}
              placeholder={t('adm.qr.key_ph', lang)} autoComplete="off" />
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

        {saveErr && <p style={{ ...s.errMsg, marginBottom: 10 }}>{saveErr}</p>}
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
  printerCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginBottom: 12 },
  tplHelp: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' },
  tplGroup: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 700, margin: '4px 0 8px' },
  printerRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  printerDel: { flexShrink: 0, width: 40, height: 48, borderRadius: 12, background: 'rgba(233,69,96,0.15)', color: '#e94560', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  tplCardDel: { flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'rgba(233,69,96,0.15)', color: '#e94560', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, marginLeft: 4 },
  block: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 16 },
  blockHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  blockTitle: { color: '#fff', fontSize: 18, fontWeight: 700 },
  switchLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  switchText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 },
  tplRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  tplRowEditing: { border: '1px solid rgba(29,161,242,0.7)', background: 'rgba(29,161,242,0.1)' },
  tplRowName: { color: '#fff', fontSize: 16, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tplRowSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '2px 0 0' },
  tplRadio: { flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  tplRadioOn: { background: '#27ae60', borderColor: '#27ae60' },
  tplActivePill: { flexShrink: 0, padding: '4px 10px', borderRadius: 20, background: 'rgba(39,174,96,0.18)', color: '#27ae60', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  tplCountFixed: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)' },
  tplGuideBtn: { width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(29,161,242,0.18)', color: '#1da1f2', fontSize: 15, fontWeight: 700 },
  tplPreviewWrap: { marginTop: 12, display: 'flex', justifyContent: 'center', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.06)', backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.08) 25%,transparent 25%),linear-gradient(-45deg,rgba(255,255,255,0.08) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(255,255,255,0.08) 75%),linear-gradient(-45deg,transparent 75%,rgba(255,255,255,0.08) 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0' },
  tplPreview: { maxWidth: 140, maxHeight: 220, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' },
  saveBtn: { width: '100%', padding: '22px', borderRadius: 16, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 20, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)', marginTop: 8 },
  savedBtn: { width: '100%', padding: '22px', borderRadius: 16, background: 'linear-gradient(90deg,#27ae60,#1e8449)', color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 },
}
