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

const T = {
  nl: {
    // WelcomeScreen
    'strip.title':       'Fotostrip',
    'strip.sub':         "{n} foto's · direct printen",
    'passport.title':    "Pasfoto's",
    'passport.sub':      'Officieel formaat 35×45 mm',
    'demo.badge':        'DEMO — betalen & printen uitgeschakeld',

    // CameraScreen
    'cam.progress':      'Foto {n} van {total}',
    'cam.hint':          'Tik om een foto te maken',
    'cam.smile':         'Lach! 😄',
    'cam.no_access':     '📵  Geen camera-toegang\n\nGa naar Instellingen → Safari → Camera → Toestaan',
    'cam.unavailable':   '📷  Camera niet beschikbaar',

    // PreviewScreen
    'prev.title':        'Jouw fotostrip',
    'prev.building':     'Wordt gemaakt…',
    'prev.pay':          'Betalen & printen — €{price}',
    'prev.retry':        '↩  Opnieuw proberen',

    // PaymentScreen
    'pay.title':         'Betaling',
    'pay.waiting':       'Wachten op bevestiging…',
    'pay.failed':        '⚠️  Betaling mislukt — probeer opnieuw',
    'pay.btn':           'Betalen met SumUp  ↗',
    'pay.back':          '← Terug naar preview',
    'pay.no_lic':        '🔒  Betalen vereist een licentie',
    'pay.no_lic_sub':    'Activeer een licentie via het admin panel (5× tik op het icoon)',

    // DoneScreen
    'done.title':        'Betaald!',
    'done.sub':          'Je strip wordt nu geprint.',
    'done.reprint':      '🖨  Opnieuw printen',
    'done.restart':      '↩  Nieuwe sessie  ({secs}s)',
    'done.no_print':     '🔒  Printen uitgeschakeld',
    'done.no_print_sub': 'Activeer een licentie via het admin panel om te printen.',

    // PassportInstructionScreen
    'pi.step':           'Stap {n} van {total}',
    'pi.next':           'Volgende  →',
    'pi.open_cam':       '📷  Camera openen',
    'pi.s1.title':       'Ga rechtop zitten',
    'pi.s1.body':        'Zit recht voor de camera op ongeveer één armslengte afstand. Rug recht, schouders ontspannen.',
    'pi.s2.title':       'Hoofd recht houden',
    'pi.s2.body':        'Houd je hoofd recht — niet omhoog of omlaag kantelen. Kin evenwijdig aan de grond.',
    'pi.s3.title':       'Kijk recht in de lens',
    'pi.s3.body':        'Kijk direct in de camera. Draai je hoofd niet naar links of rechts — beide oren moeten even ver van de camera zijn.',
    'pi.s4.title':       'Neutrale uitdrukking',
    'pi.s4.body':        'Ontspannen gezicht, mond gesloten. Geen glimlach. Dit is een officiële vereiste voor paspoort en rijbewijs.',
    'pi.s5.title':       "Maak je oren vrij",
    'pi.s5.body':        'Haar achter de oren of opgebonden. Beide oren moeten volledig zichtbaar zijn op de foto.',
    'pi.s6.title':       'Geen bril of hoofdbedekking',
    'pi.s6.body':        'Verwijder bril, zonnebril, pet of hoed. Religieuze hoofdbedekking is toegestaan mits het gezicht volledig vrij blijft.',
    'pi.s7.title':       'Let op de belichting',
    'pi.s7.body':        'Zorg voor gelijkmatige verlichting op je gezicht. Geen schaduwen op je gezicht of achter je hoofd. Witte of lichte achtergrond.',

    // PassportCameraScreen
    'pc.label':          '🪪  Pasfoto',
    'pc.hint':           'Positioneer je ogen op de gele streep',
    'pc.still':          '⚠️  Niet bewegen…',
    'pc.processing':     'Verwerken…',
    'pc.no_access':      '📵  Geen camera-toegang\n\nGa naar Instellingen → Safari → Camera → Toestaan',
    'pc.unavailable':    '📷  Camera niet beschikbaar',

    // PassportPreviewScreen
    'pp.title':          'Controleer je pasfoto',
    'pp.size':           '35 × 45 mm',
    'pp.checks_header':  'Vink alles af voor je betaalt:',
    'pp.c1':             'Neutrale uitdrukking, mond gesloten',
    'pp.c2':             'Beide ogen volledig open, recht in de lens',
    'pp.c3':             'Hoofd recht — niet gekanteld of gedraaid',
    'pp.c4':             'Beide oren volledig zichtbaar',
    'pp.c5':             'Geen bril of hoofdbedekking',
    'pp.c6':             'Geen schaduwen op het gezicht of achtergrond',
    'pp.pay':            'Betalen & printen — €{price}',
    'pp.paying':         'Bezig…',
    'pp.retake':         '↩  Opnieuw maken',

    // AdminScreen
    'adm.login.title':    'Admin toegang',
    'adm.login.pw':       'Wachtwoord',
    'adm.login.wrong':    'Onjuist wachtwoord',
    'adm.login.checking': 'Controleren…',
    'adm.login.btn':      'Inloggen',
    'adm.login.hint':     'Standaard wachtwoord: photobooth',
    'adm.title':          'Instellingen',
    'adm.lic.section':    '🪪 Licentie activeren',
    'adm.lic.label':      'Licentiecode (ontvangen van de licentie-uitgever)',
    'adm.lic.activate':   'Activeer',
    'adm.lic.remove':     'Verwijder',
    'adm.lic.removed':    'Licentie verwijderd',
    'adm.lic.invalid':    'Ongeldige licentiecode — controleer op typefouten',
    'adm.lic.expired':    'Licentie verlopen op {date}',
    'adm.lic.activated':  'Geactiveerd voor {name} — geldig t/m {date}',
    'adm.lic.valid':      '✓  {name} — geldig t/m {date}',
    'adm.lic.exp_badge':  'Verlopen op {date}',
    'adm.lic.none':       'Geen actieve licentie — DEMO modus',
    'adm.pay.section':    '💳 Betaling',
    'adm.pay.key':        'SumUp Affiliate Key',
    'adm.pay.key_ph':     'Jouw SumUp affiliate key',
    'adm.pay.price':      "Prijs fotostrip (€)",
    'adm.pay.passport':   "Prijs pasfoto's — {n} stuks (€)",
    'adm.pay.passport_simple': "Prijs pasfoto's (€)",
    'adm.pay.currency':   'Valuta',
    'adm.pay.url':        'Callback basis-URL',
    'adm.booth.section':  '📷 Fotobooth',
    'adm.booth.photos_info': "🎞️ {n} foto's per strip op {paper} — vast per papierformaat, zodat de strip altijd bij de event-template past.",
    'adm.booth.countdown':'Aftelling (1–10 sec)',
    'adm.booth.restart':  'Auto-herstart na betaling (5–120 sec)',
    'adm.booth.idle':     'Reset bij inactiviteit (10–300 sec)',
    'adm.strip.section':  '🎞️ Fotostrip',
    'adm.strip.footer':   'Footer tekst',
    'adm.strip.bg':       'Achtergrondkleur',
    'adm.pw.section':     '🔑 Wachtwoord wijzigen',
    'adm.pw.new':         'Nieuw wachtwoord',
    'adm.pw.new_ph':      'Leeg laten = geen wijziging',
    'adm.pw.confirm':     'Bevestig wachtwoord',
    'adm.pw.confirm_ph':  'Herhaal nieuw wachtwoord',
    'adm.pw.mismatch':    'Wachtwoorden komen niet overeen',
    'adm.pw.tooshort':    'Minimaal 6 tekens vereist',
    'adm.save':           'Opslaan',
    'adm.saved':          '✓  Opgeslagen!',
    'adm.save_failed':    'Opslaan mislukt — opslag vol. Verwijder een template of gebruik een kleinere PNG.',
  },

  en: {
    // WelcomeScreen
    'strip.title':       'Photo Strip',
    'strip.sub':         '{n} photos · instant print',
    'passport.title':    'Passport Photos',
    'passport.sub':      'Official format 35×45 mm',
    'demo.badge':        'DEMO — payment & printing disabled',

    // CameraScreen
    'cam.progress':      'Photo {n} of {total}',
    'cam.hint':          'Tap to take a photo',
    'cam.smile':         'Smile! 😄',
    'cam.no_access':     '📵  No camera access\n\nGo to Settings → Safari → Camera → Allow',
    'cam.unavailable':   '📷  Camera not available',

    // PreviewScreen
    'prev.title':        'Your photo strip',
    'prev.building':     'Creating…',
    'prev.pay':          'Pay & print — €{price}',
    'prev.retry':        '↩  Try again',

    // PaymentScreen
    'pay.title':         'Payment',
    'pay.waiting':       'Waiting for confirmation…',
    'pay.failed':        '⚠️  Payment failed — please try again',
    'pay.btn':           'Pay with SumUp  ↗',
    'pay.back':          '← Back to preview',
    'pay.no_lic':        '🔒  Payment requires a licence',
    'pay.no_lic_sub':    'Activate a licence via the admin panel (tap the icon 5 times)',

    // DoneScreen
    'done.title':        'Paid!',
    'done.sub':          'Your strip is now printing.',
    'done.reprint':      '🖨  Print again',
    'done.restart':      '↩  New session  ({secs}s)',
    'done.no_print':     '🔒  Printing disabled',
    'done.no_print_sub': 'Activate a licence via the admin panel to enable printing.',

    // PassportInstructionScreen
    'pi.step':           'Step {n} of {total}',
    'pi.next':           'Next  →',
    'pi.open_cam':       '📷  Open camera',
    'pi.s1.title':       'Sit up straight',
    'pi.s1.body':        'Sit straight in front of the camera at about arm\'s length. Back straight, shoulders relaxed.',
    'pi.s2.title':       'Keep your head level',
    'pi.s2.body':        'Keep your head straight — do not tilt up or down. Chin parallel to the ground.',
    'pi.s3.title':       'Look straight into the lens',
    'pi.s3.body':        'Look directly into the camera. Do not turn your head — both ears must be equidistant from the camera.',
    'pi.s4.title':       'Neutral expression',
    'pi.s4.body':        'Relaxed face, mouth closed. No smile. This is an official requirement for passport and driving licence.',
    'pi.s5.title':       'Keep your ears visible',
    'pi.s5.body':        'Hair behind the ears or tied up. Both ears must be fully visible in the photo.',
    'pi.s6.title':       'No glasses or head covering',
    'pi.s6.body':        'Remove glasses, sunglasses, cap or hat. Religious head coverings are allowed provided the face remains fully visible.',
    'pi.s7.title':       'Check the lighting',
    'pi.s7.body':        'Ensure even lighting on your face. No shadows on your face or behind your head. White or light background.',

    // PassportCameraScreen
    'pc.label':          '🪪  Passport Photo',
    'pc.hint':           'Align your eyes with the yellow line',
    'pc.still':          '⚠️  Hold still…',
    'pc.processing':     'Processing…',
    'pc.no_access':      '📵  No camera access\n\nGo to Settings → Safari → Camera → Allow',
    'pc.unavailable':    '📷  Camera not available',

    // PassportPreviewScreen
    'pp.title':          'Check your passport photo',
    'pp.size':           '35 × 45 mm',
    'pp.checks_header':  'Check all items before paying:',
    'pp.c1':             'Neutral expression, mouth closed',
    'pp.c2':             'Both eyes fully open, looking straight into the lens',
    'pp.c3':             'Head straight — not tilted or turned',
    'pp.c4':             'Both ears fully visible',
    'pp.c5':             'No glasses or head covering',
    'pp.c6':             'No shadows on the face or background',
    'pp.pay':            'Pay & print — €{price}',
    'pp.paying':         'Processing…',
    'pp.retake':         '↩  Retake',

    // AdminScreen
    'adm.login.title':    'Admin access',
    'adm.login.pw':       'Password',
    'adm.login.wrong':    'Incorrect password',
    'adm.login.checking': 'Checking…',
    'adm.login.btn':      'Log in',
    'adm.login.hint':     'Default password: photobooth',
    'adm.title':          'Settings',
    'adm.lic.section':    '🪪 Activate licence',
    'adm.lic.label':      'Licence code (received from the licence issuer)',
    'adm.lic.activate':   'Activate',
    'adm.lic.remove':     'Remove',
    'adm.lic.removed':    'Licence removed',
    'adm.lic.invalid':    'Invalid licence code — check for typos',
    'adm.lic.expired':    'Licence expired on {date}',
    'adm.lic.activated':  'Activated for {name} — valid until {date}',
    'adm.lic.valid':      '✓  {name} — valid until {date}',
    'adm.lic.exp_badge':  'Expired on {date}',
    'adm.lic.none':       'No active licence — DEMO mode',
    'adm.pay.section':    '💳 Payment',
    'adm.pay.key':        'SumUp Affiliate Key',
    'adm.pay.key_ph':     'Your SumUp affiliate key',
    'adm.pay.price':      'Photo strip price (€)',
    'adm.pay.passport':   'Passport photos price — {n} pcs (€)',
    'adm.pay.passport_simple': 'Passport photos price (€)',
    'adm.pay.currency':   'Currency',
    'adm.pay.url':        'Callback base URL',
    'adm.booth.section':  '📷 Photo Booth',
    'adm.booth.photos_info': '🎞️ {n} photos per strip on {paper} — fixed per paper size, so the strip always matches the event template.',
    'adm.booth.countdown':'Countdown (1–10 sec)',
    'adm.booth.restart':  'Auto-restart after payment (5–120 sec)',
    'adm.booth.idle':     'Reset on inactivity (10–300 sec)',
    'adm.strip.section':  '🎞️ Photo Strip',
    'adm.strip.footer':   'Footer text',
    'adm.strip.bg':       'Background colour',
    'adm.pw.section':     '🔑 Change password',
    'adm.pw.new':         'New password',
    'adm.pw.new_ph':      'Leave empty to keep current',
    'adm.pw.confirm':     'Confirm password',
    'adm.pw.confirm_ph':  'Repeat new password',
    'adm.pw.mismatch':    'Passwords do not match',
    'adm.pw.tooshort':    'Minimum 6 characters required',
    'adm.save':           'Save',
    'adm.saved':          '✓  Saved!',
    'adm.save_failed':    'Save failed — storage full. Remove a template or use a smaller PNG.',
  },
}

export function t(key, lang = 'nl', vars = {}) {
  const text = T[lang]?.[key] ?? T.nl[key] ?? key
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), text)
}

// ISO yyyy-mm-dd → dd-mm-yyyy voor weergave
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}
