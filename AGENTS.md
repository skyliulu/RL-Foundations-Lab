# RL Foundations Lab repository guidance

Use `.agents/skills/develop-interactive-rl-chapter/SKILL.md` whenever creating, modifying, correcting, refactoring, or validating a learning chapter.

## Non-negotiable content rules

- Preserve the source material's conceptual sequence, definitions, and intermediate derivations.
- Do not show lecture numbers, slide numbers, PDF pages, or courseware-production notes in reader-facing headings or prose. Keep provenance in chapter source metadata and the final references section.
- Build a continuous explanation in the main reading column. Interactions supplement that explanation; they never replace required text or mathematics.
- Render ordinary article sections as prose with a clear eyebrow and heading; do not turn them into numbered timeline cards unless sequence numbers carry teaching meaning.
- Use one shared chapter frame for article sections, derivations, transitions, and interactive canvases. A narrower readable prose column is allowed inside that frame, but it must share a deliberate alignment edge and preserve a clean transition into adjacent interactive blocks.
- Keep the same readable text column from the chapter opening through its summary and references; do not alternate among unrelated centered widths.
- Explain every technical term, acronym, named algorithm, assumption, and symbol at its first reader-visible occurrence or establish it explicitly earlier. Do not mention future-chapter terminology as unexplained decoration.
- Build each chapter as a continuous article with motivation, definitions, derivation or justification, experiment, interpretation, and transition. Generic knowledge-card grids cannot carry the primary teaching content.
- Use cards only for genuinely parallel or optional material such as comparisons, presets, warnings, glossaries, and controls.
- Connect abstract definitions to the shared grid world where appropriate.
- Maintain equivalent Chinese and English structures.
- Preserve source completeness: core named algorithms, variants, pseudocode, theorem assumptions, convergence meaning, comparisons, and worked examples must each have a visible destination in the chapter.
- Make every major transition answer why the previous method is insufficient, what the new mechanism changes, why it is valid, how the running example changes, and what tradeoff remains.
- Surpass the source through synchronized interaction and counterfactual exploration, never by shortening away its conceptual or mathematical spine.
- Reject generic renamed charts when the chapter requires dedicated algorithm state such as an episode tape, Q table, policy map, replay buffer, target network, or actor-critic loop.

## Mathematical rendering

- Store mathematical expressions as valid LaTeX strings and render them with the shared `MathFormula` component.
- Route formula-like runs in prose, pseudocode, tables, controls, captions, and the right workbench through the shared math-rendering boundary. Raw Unicode pseudo-formulas are not acceptable reader-facing output.
- Treat the legacy inline-math normalizer as migration compatibility, not an authoring format; new and edited formulas must be explicit valid LaTeX.
- Before release, audit every chapter DOM in both languages: formula-like text outside `.math-formula` is a failure. Measure every algorithm, table, inspector, and workbench surface on desktop and mobile rather than sampling one component.
- Do not assemble formulas with Unicode superscripts/subscripts, HTML `<sub>/<sup>`, or hand-styled fragments.
- Keep a complete derivation chain visible in the article. Make each transformation line selectable and send its explanation, rule, assumptions, symbols, and before/after LaTeX to the right workbench.
- Do not add standalone Derivation Explorer interfaces that hide or duplicate the article derivation.

## Required synchronization

When a chapter changes, update together:

1. bilingual content and source metadata;
2. chapter rendering and right-workbench context;
3. schema and content-contract tests;
4. mathematical rendering tests;
5. desktop/mobile rendered QA.

During rendered QA, compare the left and right edges of the chapter opening, prose, derivation, experiment entry, post-experiment interpretation, summary, and references. Reject accidental width changes, narrow-wide-narrow component rhythms, decorative gutters, oversized display math, or spacing that makes one continuous chapter look like unrelated cards.

For interaction CSS, scope structural rules to direct children or dedicated classes. Do not target generic descendant `span`, `small`, or `strong` nodes inside components that can contain `MathText` or KaTeX. Keep flex/grid children shrinkable with `min-width: 0`, isolate intentional horizontal scrolling to a named inner surface, and reject any chapter experiment whose outer root overflows in either language at mobile, tablet, or desktop widths.

For mathematical QA, run formula-like copy through the same `MathText` branch and strict KaTeX renderer used in production. Full-width prose punctuation must not be swallowed as part of one standalone formula. Across every interaction in both languages, reject `.katex-error`, visible raw LaTeX commands, formulas rendered below 12 px, and any structural selector that reaches into KaTeX's internal spans. Review the complete interaction at rendered size, including dense tables and scroll surfaces.

During content QA, record the first reader-visible occurrence of chapter-specific terminology. Reject unexplained references to concepts introduced only in later chapters and reject chapters whose required knowledge exists mainly as cards rather than a readable argument.

Also maintain a source-coverage matrix. Every required source item must map to prose, a derivation, complete pseudocode, a worked example, or an experiment; formulas alone do not count as coverage of an algorithm.

Run `npm test` and `npm run build`, then inspect the affected chapter at desktop and mobile widths with zero console errors.
