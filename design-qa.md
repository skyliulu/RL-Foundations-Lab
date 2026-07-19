**Comparison Target**

- Source visual truth: `output/design-audit/2026-07-19-layout-and-derivation/01-reading-shell.png` and `output/design-audit/2026-07-19-layout-and-derivation/03-bellman-reading-and-canvas.png`
- Implementation screenshots: `output/design-audit/2026-07-19-layout-and-derivation/review-reading-shell.png` and `output/design-audit/2026-07-19-layout-and-derivation/review-derivation.png`
- Combined comparison evidence: `output/design-audit/2026-07-19-layout-and-derivation/qa-shell-comparison.png` and `output/design-audit/2026-07-19-layout-and-derivation/qa-derivation-comparison.png`
- Viewport: 1365 × 900 desktop
- State: default compact left rail, reading-context right dock, symbolic derivation step 02

**Findings**

- No actionable P0, P1, or P2 issues remain.
- Fonts and typography: the review page reuses the product's Chinese serif reading stack, sans-serif UI stack, and Cambria/Times math fallback. The hierarchy and line lengths remain consistent with the source while the mock deliberately increases small UI text where the audit found readability risk.
- Spacing and layout rhythm: the existing paper-like margins, thin rules, and editorial cadence are preserved. The proposed 96px / content / 52px shell gives the center visibly more room without changing the source's reading tone.
- Colors and visual tokens: paper, ink, navy, teal, amber, and border opacities map directly to the current product tokens.
- Image quality and asset fidelity: all three evidence images are original local screenshots with no placeholder or reconstructed assets. Images remain sharp at the review viewport.
- Copy and content: the three decisions, Bellman formulas, derivation reasons, assumptions, and numeric bindings match the audited product direction and course terminology.

**Interaction Checks**

- Left rail expands from 96px to a 248px overlay without changing the center track.
- Formula symbol selection opens formula context and resolves the selected symbol.
- Canvas focus mode removes both rails from the mock shell.
- Derivation switches between symbolic and numeric views.
- Previous/next navigation and the five-card expanded derivation both work.
- Browser console errors checked: none.

**Comparison History**

- Pass 1: source and implementation were compared in the combined shell and derivation images at the same desktop viewport. No actionable P0/P1/P2 mismatch was found; the structural differences are the explicit subject of the direction proposal rather than unintended design drift.

**Follow-up Polish**

- [P3] If this direction is approved, validate the final implementation at 200% zoom and with keyboard-only navigation; those checks belong to the production pass rather than this local direction review.

final result: passed
