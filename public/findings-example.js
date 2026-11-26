// Example data for report-template.html («Deconstruction of artichokes with cured ham»).
// Made-up data about a made-up website (example.com): copy the format, not the content.
//
// How to use it: write your own audit/findings.js with this same shape and save it next to
// 05-report.html. The report paints itself from it; there is nothing to edit in the HTML.
//
// Fields
// - website: { name, url } · system: { url, version } · date: 'YYYY-MM-DD' · author: who and with what
// - sample: { structured, random } (numbers) · viewports: optional text
// - demoScope: true only if the sample was cut for a talk demo
// - summary: { coverage (0–100, decimals allowed: share of what is seen that comes from the system), drift (number of hand-written values) }
// - michelin: five { points (0–3), evidence }, one per criterion and in this order. Each criterion is
//   the official Michelin one, translated to the design system, and is scored with what its steps found:
//   1 «Quality of ingredients»: tokens and assets with a single source, typed, and with origin (steps 0 · 1)
//   2 «Mastery of techniques»: components faithful to their specs, accessible, and with all their states (steps 2 · 4)
//   3 «Harmony of flavors»: the same problem, solved the same way everywhere (steps 1 · 3)
//   4 «Personality of the chef expressed in their cuisine»: the brand is recognizable without seeing the logo (steps 0 · 3)
//   5 «Consistency across the entire menu and over time»: across the entire sample and from one audit to the
//     next (steps 1 · 6); on a first audit, score only the whole sample and say so
//   Points: 0 no star · 1 ★ worth a stop · 2 ★★ worth a detour · 3 ★★★ worth the journey.
//   evidence: one or two short sentences that justify the points, citing H-XX or the file they come from
// - health: { coverage, drift, duplicates, orphans, parity } (short texts, may cite files and H-XX)
// - findings: one object per finding, ordered by impact
//   - id: 'H-01', 'H-02'… (unique; it names its screenshots)
//   - title · page (full URL) · selector · state (only if not the normal state: 'focus', 'hover'…)
//   - layer · currentValue · systemValue · rule · impact ('high' | 'medium' | 'low')
//   - effort ('low' | 'medium' | 'high') · proposal
//   - screenshots: one { width, alt } for each width of step 1 where the finding fails (width in px).
//     Its file is screenshots/<id>-<width>.png (H-01-1440.png, H-01-360.png…). Optional context:
//     alt of a second screenshot at that width, screenshots/<id>-<width>-context.png
//     screenshots: [] only when there is nothing visual to capture (a token file, a pattern the system
//     lacks): the card then says the evidence is in its source
//   - source: the file the evidence comes from (e.g. '02-puree.md')
//   - verified: false when your AI writes it; true only after you check it yourself (then ask your AI to set it)
//   - fixedIn ('System' | 'Product' | 'Governance'), round, criterion: null until step 6
// - discarded: what the AI proposed and is not a finding, each { type, title, reason } with type:
//   'false positive' (checked, and it is not a failure) ·
//   'to verify' (it may be a failure, but it could not be proven; add howToCheck: what would prove it) ·
//   'seen in passing' (not about the design system or accessibility; add passTo: who it is passed to)
window.findings = {
  website: { name: 'Example shop', url: 'https://example.com/' },
  system: { url: 'https://example.com/system', version: '1.0.0' },
  date: '2026-11-25',
  author: 'Your name, with your AI agent and its browser',
  sample: { structured: 3, random: 1 },
  demoScope: false,
  summary: { coverage: 72, drift: 14 },
  michelin: [
    { points: 2, evidence: 'DTCG tokens, typed and with origin; two duplicated greys (H-02).' },
    { points: 1, evidence: 'The menu focus is not visible (H-01) and the primary button falls outside the scale (H-03).' },
    { points: 2, evidence: 'The contact and subscription forms follow the same pattern.' },
    { points: 2, evidence: 'The voice is recognizable; two buttons say «Send» instead of what they do.' },
    { points: 1, evidence: 'First audit: there is no comparison over time yet.' },
  ],
  health: {
    coverage: '72% of what is seen comes from semantic tokens, 14% from primitives used directly and 14% is hand-written (01-spoonfuls-of-broth.md).',
    drift: '14 hand-written values, mostly text greys and button padding.',
    duplicates: 'Three nearly identical text greys where the system has one (H-02).',
    orphans: 'A product card that the system does not document (02-puree.md).',
    parity: 'The documentation and the token file match, except for the spacing scale (00-ingredients.md).',
  },
  findings: [
    {
      id: 'H-01',
      title: 'Focus is not visible in the main menu',
      page: 'https://example.com/',
      selector: 'header nav a',
      state: 'focus',
      layer: 'Low temperature · accessibility',
      currentValue: 'outline: none',
      systemValue: 'outline: 2px solid var(--color-focus)',
      rule: 'WCAG 2.4.7 Focus Visible · system › Accessibility › Focus',
      impact: 'high',
      effort: 'low',
      proposal: 'Remove the outline: none from the menu and use the system focus ring.',
      screenshots: [
        { width: 1440, alt: '«Shop» link in the menu with keyboard focus and no visible ring.' },
      ],
      source: '04-low-temperature.md',
      verified: true,
      fixedIn: 'Product',
      round: 1,
      criterion: 'On https://example.com/, when reaching header nav a with Tab, the computed style has outline-width: 2px.',
    },
    {
      id: 'H-02',
      title: 'Three text greys that are not in the system',
      page: 'https://example.com/products',
      selector: '.card p, .footer small',
      layer: 'Broth · tokens',
      currentValue: '#6b6b6b · #707070 · #727272',
      systemValue: 'var(--color-text-muted) · #666666',
      rule: 'System › Color › Secondary text',
      impact: 'medium',
      effort: 'low',
      proposal: 'Replace the three greys with the semantic token for secondary text.',
      screenshots: [
        { width: 1440, alt: 'Three product cards in a row, with the description text in three different greys.', context: 'The products page with the three cards highlighted.' },
        { width: 360, alt: 'The same three cards, stacked, with the three greys in the description.' },
      ],
      source: '01-spoonfuls-of-broth.md',
      verified: false,
      fixedIn: null,
      round: null,
      criterion: null,
    },
    {
      id: 'H-03',
      title: 'Primary button with padding outside the scale',
      page: 'https://example.com/contact',
      selector: 'form .button--primary',
      layer: 'Purée · components',
      currentValue: 'padding: 14px 20px',
      systemValue: 'padding: 16px 24px · var(--space-2) var(--space-3)',
      rule: 'System › Button › Sizes',
      impact: 'low',
      effort: 'low',
      proposal: 'Use the system medium button size instead of hand-written padding.',
      screenshots: [
        { width: 360, alt: '«Send message» button in the contact form, slightly shorter than the other buttons.' },
      ],
      source: '02-puree.md',
      verified: false,
      fixedIn: null,
      round: null,
      criterion: null,
    },
  ],
  discarded: [
    { type: 'false positive', title: 'Low contrast on a disabled button', reason: 'WCAG 1.4.3 does not require minimum contrast for inactive controls.' },
    { type: 'to verify', title: 'The error message is not announced', reason: 'The error has role=alert, but it has not been tested with a screen reader.', howToCheck: 'Submit the empty contact form with NVDA or VoiceOver and listen for the error.' },
    { type: 'seen in passing', title: 'An analytics script loads before consent', reason: 'The request is visible with cookies rejected. It is not about the design system.', passTo: 'Whoever handles privacy and cookies' },
  ],
};
