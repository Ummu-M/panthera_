// Single source of truth for color. Import this everywhere instead of
// redefining a local `C = {...}` object per page — that copy-paste is what
// caused the palette drift between admin/dashboard/legacy pages.
//
// KU brand pass: light theme, sky blue + white. Token names kept the same
// (forest*, teal*, gold*) so every page that already imports `theme` still
// works without a rewrite — only the values changed, from dark green/gold
// to white/sky-blue. gold* now carries the primary brand accent (was the
// Panthera crest gold, now KU sky blue); teal* is kept as the semantic
// "positive/success" color used for active/paid status pills.
export const theme = {
  forest950: '#d4e3ef',        // page background — medium blue-gray
  forest900: '#bfd4e3',        // gradient end / secondary background
  forest850: '#ffffff',        // panel background — stays white so panels visibly lift off the page
  forest800: '#e6f0f6',        // panel alt / hover background
  teal500: '#1e9e6b',          // success/positive accent (status pills)
  teal400: '#4cc38a',
  gold500: '#287fba',          // primary accent — deeper medium blue
  gold600: '#1d6394',          // darker blue, hover/active states
  text: '#122435',             // primary text — dark navy, not pure black
  muted: '#5b7286',
  border: 'rgba(46, 155, 236, 0.25)',
  danger: '#d64545',
} as const

// Shared "shield" clip-path — the one recurring shape that ties the badge/
// emblem visual language together across the whole app (avatars, icon
// frames, leadership cards, event markers). Import this wherever a circle
// or square icon frame would otherwise be used, so the motif stays
// consistent everywhere rather than being reinvented per page.
export const shieldClip = 'polygon(50% 0%, 100% 20%, 100% 66%, 50% 100%, 0% 66%, 0% 20%)'
