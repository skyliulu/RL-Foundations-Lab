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

## Source Completeness Contract

- Build a source-coverage matrix before drafting. Enumerate every core definition, named algorithm, algorithm variant, pseudocode loop, theorem or convergence condition, comparison, and worked example in the assigned source range.
- Classify each source item as main-path required, optional deepening, or intentionally out of scope. Required items must map to a visible article block, derivation, algorithm block, worked example, or experiment; they may not disappear into a summary sentence.
- Preserve algorithm families and their evolution. Do not collapse MC Basic, data-efficient MC, Exploring Starts, soft-policy control, and epsilon-greedy control into one generic "Monte Carlo" paragraph; apply the same rule to every chapter.
- Preserve the source's useful repetition when it changes the reader's understanding: a definition, a step-by-step execution, a failure case, and a theorem are different teaching functions even when they reuse one equation.
- Treat a chapter as incomplete when its formulas are present but its algorithm variants, pseudocode, assumptions, convergence meaning, or worked examples are missing.

## Know-Why Contract

- Every major transition must explicitly answer five questions in the main article: what limitation remains, what new mechanism is introduced, why the mechanism is mathematically valid, what the running example does differently, and what tradeoff or new failure mode appears.
- Do not present an algorithm as a finished recipe before motivating the problem that forces each of its steps.
- Connect formulas through causal prose. The reader should be able to explain why the next line or algorithm exists, not only recognize its final form.
- Keep "know how" artifacts such as pseudocode, controls, and execution traces, but pair them with "know why" explanations and counterfactual comparisons.
- Surpass the source through interaction, not subtraction: retain the source's conceptual and mathematical completeness, then add synchronized state, parameter manipulation, counterexamples, step replay, and contextual explanations.

## Algorithm and Worked-Example Contract

- Render complete pseudocode for every required named algorithm, including initialization, sampling/data requirements, update timing, policy improvement, termination or repetition conditions, and returned object.
- Walk at least one source-aligned example through the algorithm state. Show the exact episode or transition, derived target or return, value before and after, policy before and after, and why the next algorithmic decision changes.
- Use a dedicated experiment model when chapters manipulate different mathematical objects. A generic curve with renamed labels is not an acceptable substitute for an episode tape, value table, policy map, replay buffer, target network, or actor-critic update loop.
- Let interactions expose the algorithm's internal evidence and counterfactuals: what would change under another variant, target, step size, exploration rule, or update schedule.

## Mathematical Content

- Store every mathematical expression as valid LaTeX source, preferably with `String.raw` for backslash-heavy strings.
- Render math only through the shared `MathFormula` component. Do not hand-build math with Unicode superscripts/subscripts, HTML `<sub>/<sup>`, or visual approximations.
- Treat display equations, inline symbols, axis labels, value cells, derivation steps, table entries, and right-workbench content consistently.
- Do not place formula-looking text such as `Gₜ`, `Vπ(s)`, `p(s′|s,a)`, or `γ = 0.9` directly in JSX. Convert it to valid LaTeX and render it with `MathFormula`, including inside labels, mappings, assumptions, and contextual explanations.
- Fail tests on invalid LaTeX or on newly introduced mathematical pseudo-markup.
- Fix repeated math defects at the shared rendering boundary first. Paragraph, pseudocode, worked-table, caption, control, and workbench renderers must all route formula runs through the math component; chapter-by-chapter string replacement is not a complete repair.
- Treat automatic normalization of legacy pseudo-math as migration compatibility only. New or edited mathematical content must still be stored as explicit valid LaTeX.

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

## Readability and Reference Contract

- Set an explicit typography floor instead of shrinking text to fit dense interfaces. At the normal desktop viewport, keep article prose at least 14 px, supporting labels and explanations at least 12 px, and dense code or table cells at least 11 px.
- Apply the floor to pseudocode, algorithm comparisons, worked-example tables, ledgers, controls, chart labels, inspectors, and the right workbench. If larger text no longer fits, add wrapping, scrolling, or a responsive layout instead of reducing the type again.
- Inspect representative long Chinese and English labels at desktop and mobile widths. Do not approve a component from CSS values alone.
- Keep interaction CSS structurally scoped. Never use a broad descendant selector such as `.component span` for a step badge, label, or token when `MathText` or KaTeX may add nested spans; target a direct child or a dedicated class instead.
- Treat every `MathFormula` boundary as third-party nested markup: structural rules must stop at the wrapper, and no component rule may position, size, pad, grid, or flex arbitrary descendant `span` nodes inside it.
- Keep rendered formulas inside interactions at least 12 px at normal reading size. Formula tables, operator summaries, update ledgers, and control labels must wrap or own an explicit inner horizontal scroll surface instead of shrinking below that floor.
- Give semantically different diagrams distinct class names even when their visible nouns overlap. A token strip and a token ledger, for example, must not share one layout class.
- Put `min-width: 0` on flex/grid children that contain bilingual text, let labels wrap before shrinking type, and make only the designated formula/table/trajectory surface own horizontal scrolling.
- Render one final `Sources and further reading` section per chapter. Put source-specific and conceptual references in that section; do not append a second global concept-source footer beneath it.
- Keep reference labels and page metadata readable, aligned to the chapter column, and free of duplicated links.

## Acceptance Checks

- Search reader-facing strings for `课件`, `slide`, `lecture`, `PDF p`, and page-number production labels.
- Search JSX/content for math-like `<sub>`, `<sup>`, Unicode pseudo-formulas, and raw formula strings bypassing `MathFormula`.
- Search right-workbench mappings, assumptions, controls, table cells, and captions for formula-looking plain text.
- Validate every LaTeX string with the same renderer used at runtime.
- Exercise the exact `MathText` runtime branch for every formula-like string, including pseudocode with full-width Chinese punctuation. Reject every rendered `.katex-error`, visible raw command, or formula wrapper below the 12 px floor.
- Traverse the rendered DOM of every chapter in both languages. Any formula-like text node outside `.math-formula` is a release-blocking failure; report its chapter and parent selector.
- Confirm every derivation line remains visible before and after clicking.
- Confirm a selected line updates the right workbench without changing the mathematical chain.
- Inspect desktop and mobile renders at actual reading size.
- Traverse all chapter interactions in both languages at narrow mobile, tablet, and desktop widths. Reject any experiment root whose `scrollWidth` exceeds its `clientWidth`, unless the excess belongs to an explicit inner scroll surface whose children remain internally legible.
- Inspect nested `MathText` and KaTeX markup against component CSS. A rule intended for a structural badge, row, or label must not match the renderer's internal spans.
- Capture each complete interaction, not only its header or one convenient state, and inspect dense formulas, tables, action lists, and scroll surfaces at their actual rendered size.
- List the first occurrence of every chapter-specific technical term and confirm that occurrence includes a definition or local explanation.
- Confirm required teaching content forms a coherent article without relying on generic card grids.
- Compare the completed chapter against its source-coverage matrix and fail it if any required algorithm, variant, theorem condition, comparison, pseudocode stage, or worked example lacks a visible destination.
- For every named algorithm, confirm that the reader can identify the limitation that motivated it, its complete execution loop, why its update is valid, and its tradeoff relative to the previous method.
- Reject generic experiments whose visible state does not correspond to the chapter's actual algorithm state and data flow.
- Measure the rendered left and right edges of the opening, representative prose, experiment entry, post-experiment interpretation, summary, and references. Confirm they use the same chapter grid and text column rather than unrelated widths.
- Measure every algorithm, pseudocode, worked-example table, experiment inspector, and right-workbench text surface on desktop and mobile. Reject any value below the readability floor unless a documented graphical exception remains legible at actual size; a single representative sample cannot close a site-wide typography issue.
- Confirm each chapter ends with one source section and no separate concept-source footer.
