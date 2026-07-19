---
name: develop-interactive-rl-chapter
description: Create, modify, refactor, correct, and validate interactive reinforcement-learning chapters in this repository. Use for chapter prose, mathematical derivations, LaTeX rendering, course-world experiments, bilingual content, source alignment, right-rail explanations, or chapter-level UI and QA.
---

# Develop Interactive RL Chapter

Preserve the source material's conceptual spine while turning it into a continuous, bilingual, interactive learning chapter.

## Workflow

1. Read `AGENTS.md`, the relevant source PDF, current chapter content, components, and tests.
2. Map the reader's conceptual sequence before editing. Each section must answer why the next definition or equation is needed.
3. Build a first-use inventory for technical terms and symbols. Locate the first reader-visible occurrence of each item and confirm it is defined there or was defined earlier.
4. Write the complete explanation and derivation in the main reading column first.
5. Add interactions only where manipulating a state, parameter, branch, or derivation step improves understanding.
6. Keep Chinese and English structures equivalent and source-traceable.
7. Run content-contract tests, production build, desktop/mobile rendered inspection, and console-error checks.

## Reader-Facing Content

- Do not expose production notes such as lecture numbers, slide numbers, PDF pages, or phrases like "according to the courseware" in chapter headings, kickers, formulas, or body copy.
- Keep source provenance in metadata, tests, and the final references section only.
- Prefer continuous prose and visible derivations over card mosaics.
- Render ordinary sections as a compact eyebrow plus semantic heading and prose. Do not add numbered rails, timelines, or card chrome unless the numbering itself teaches a meaningful sequence.
- Introduce every symbol before using it. Explain why a quantity is needed, what it means, and how it connects to the running grid-world example.
- Preserve important definitions and intermediate algebra from the source; do not compress them into a summary card.

## Concept First-Use Contract

- Explain a technical concept at its first reader-visible occurrence, or establish it explicitly in an earlier section or prerequisite.
- Do not use unexplained future-chapter names as motivational decoration. Replace them with plain-language descriptions until the chapter that actually introduces them.
- If brief foreshadowing is necessary, explain the minimum meaning in the same sentence and state that the formal definition comes later.
- Apply the same rule to acronyms, named algorithms, operators, assumptions, and mathematical symbols.
- Read headings, introductions, captions, controls, sidebars, summaries, and navigation copy as part of the first-use audit; a term can appear prematurely outside the main prose too.

## Article-First Chapter Contract

- Build the primary learning path as continuous prose, definitions, examples, and visible derivations—not as a collection of interchangeable knowledge cards.
- Give every chapter a connected argument: motivate the problem, introduce required concepts, derive or justify the method, embed an experiment that tests the argument, interpret the result, and transition forward.
- Use cards only for genuinely parallel or optional material such as comparison summaries, presets, warnings, glossaries, or controls.
- Do not use a generic card grid as the main container for required explanations or mathematics.
- Reject a chapter if removing the cards would leave no coherent article to read from top to bottom.

## Mathematical Content

- Store every mathematical expression as valid LaTeX source, preferably with `String.raw` for backslash-heavy strings.
- Render math only through the shared `MathFormula` component. Do not hand-build math with Unicode superscripts/subscripts, HTML `<sub>/<sup>`, or visual approximations.
- Treat display equations, inline symbols, axis labels, value cells, and derivation steps consistently.
- Fail tests on invalid LaTeX or on newly introduced mathematical pseudo-markup.

## Interactive Derivation Contract

- Keep the full equality chain visible in the main article at all times.
- Make each transformation line clickable; selection may highlight a line but must not hide other lines.
- Send the selected line's context to the right workbench with:
  - the transformation or theorem used;
  - a concise explanation;
  - a complete explanation tied to the previous and next lines;
  - assumptions and symbol meanings;
  - the exact LaTeX before and after the transformation.
- Do not create a standalone Derivation Explorer that replaces or duplicates the article derivation.
- Ensure keyboard focus, `aria-pressed` or `aria-current`, and visible selected state.

Use this shape for derivation data:

```js
{
  id: 'split-first-term',
  latex: String.raw`G_t = R_{t+1} + \gamma G_{t+1}`,
  rule: '拆出第一项并识别剩余回报',
  short: '把无限和分成下一步奖励与余下未来。',
  detail: '...',
  assumptions: [String.raw`0 \le \gamma < 1`, 'rewards are bounded'],
  symbols: [['G_t', 'return from time t']],
}
```

## Interaction Placement

- Introduce state, action, transition, policy, and reward before asking readers to manipulate the course world.
- Embed experiments where they test the preceding argument.
- Keep experiments stateless and reproducible; expose seeds and comparison conditions when randomness matters.
- Use the right workbench for contextual depth, not for essential definitions missing from the article.

## Chapter Layout Contract

- Define one chapter shell and alignment grid for the header, article sections, derivations, transitions, experiments, summary, and references.
- Keep the same readable text column from the chapter opening through the closing summary and references. Do not alternate among unrelated centered widths.
- Place experiments as intentional wide regions inside the same chapter shell. Their outer edges must follow the shared grid, and entry/exit copy must return to the same text column.
- Do not create a narrow-wide-narrow rhythm merely because components have different `max-width` values.
- Render supporting equations compactly near the prose. Use display math only when the equation needs its own reading step; do not enlarge every formula or force each short expression onto a separate row.
- Inspect adjacent block edges and vertical rhythm in rendered desktop and mobile output, not only individual components.

## Acceptance Checks

- Search reader-facing strings for `课件`, `slide`, `lecture`, `PDF p`, and page-number production labels.
- Search JSX/content for math-like `<sub>`, `<sup>`, Unicode pseudo-formulas, and raw formula strings bypassing `MathFormula`.
- Validate every LaTeX string with the same renderer used at runtime.
- Confirm every derivation line remains visible before and after clicking.
- Confirm a selected line updates the right workbench without changing the mathematical chain.
- Inspect desktop and mobile renders at actual reading size.
- List the first occurrence of every chapter-specific technical term and confirm that occurrence includes a definition or local explanation.
- Confirm required teaching content forms a coherent article without relying on generic card grids.
- Measure the rendered left and right edges of the opening, representative prose, experiment entry, post-experiment interpretation, summary, and references. Confirm they use the same chapter grid and text column rather than unrelated widths.
