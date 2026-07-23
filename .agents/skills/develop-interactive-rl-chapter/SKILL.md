---
name: develop-interactive-rl-chapter
description: Create, modify, refactor, correct, audit, and validate interactive reinforcement-learning chapters in this repository. Use for chapter prose, content organization and continuity reviews, mathematical derivations, LaTeX rendering, course-world experiments, bilingual content, source alignment, right-rail explanations, or chapter-level UI and QA.
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

## Expository Tone Contract

- Write the article in a formal, precise, and economical expository style. Prefer declarative headings that name the concept, mechanism, derivation, condition, or conclusion being developed.
- Do not simulate `know why` by turning every section into a rhetorical question. A sequence of headings beginning with “why”, “how”, “what”, “为什么”, or “怎样” creates a Q&A rhythm and does not by itself establish causality.
- Make the rationale emerge from the argument itself: state the previous method's limitation in prose, derive the required mechanism, expose its consequence in the running example, and let the experiment supply observable evidence.
- Reserve direct questions for moments where the reader must make a real prediction, choose between counterfactuals, or confront a genuinely unresolved problem. Use them sparingly and resolve them with the immediately following evidence.
- Avoid conversational transition labels such as “only now unify”, “finally we can abstract”, “don't just ask”, “现在才进行统一”, “终于可以抽象”, or “别只问”. Replace them with the mathematical or conceptual role of the section.
- Audit headings separately from prose. If the chapter reads like an FAQ after removing the body text, rewrite the headings even when the underlying causal sequence is correct.

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

## Continuous-Argument Contract

- Define one unresolved teaching problem for the chapter and write a causal spine before choosing components. Every required block must advance that spine rather than restart the topic from a new label.
- Prefer the sequence concrete problem, failed or insufficient approach, required mechanism, derivation or justification, worked consequence, experiment, interpretation, and remaining limitation. Depart from it only when the source's conceptual order requires another explicit progression.
- Introduce a unifying abstraction only after the reader has seen enough concrete evidence to earn it. Do not open with a taxonomy such as "MC, TD, and SGD share one form" when the chapter has not yet established those mechanisms.
- Make every section opening depend on the previous section's conclusion. State the unanswered question or limitation that forces the next step; do not rely on headings, kickers, arrows, or adjacency to imply the connection.
- Avoid ordered fragments: several correct sections are still a failure when each repeats the motivation, restates the same conclusion, or can be freely reordered without changing the argument.
- Keep one running example or data trace through definitions, derivations, algorithms, and the experiment whenever the mathematics permits. Do not reset to unrelated toy examples merely to fill a fixed content slot.
- Use synthesis, comparison, and "unified form" sections as earned conclusions or bridges, not premature opening decoration.
- Introduce a named algorithm only after the reader has encountered the concrete limitation, seen the required mathematical object, and derived or justified the update it names. The name should consolidate an earned mechanism, not announce an unexplained topic.
- When a later variant changes evidence quantity, update frequency, or compute schedule rather than the learning objective, state that invariant first and derive the variant from the exposed tradeoff. Do not let mini-batch, replay, target-network, or clipping variants appear as adjacent vocabulary.
- Audit the chapter twice: read only the prose while ignoring headings and chrome, then read only the transitions between blocks. Both passes must reveal a continuous argument with no unexplained jumps.
- Reject a chapter when its facts are individually accurate but the reader cannot answer why this paragraph, equation, or experiment must appear at this exact point.

## Chapter 7 Pilot Standard

Use the rebuilt stochastic-approximation chapter as the structural reference for every chapter, without copying its subject-specific components.

- Open with one concrete unresolved problem inherited from the previous chapter. The first paragraph must state what the reader can already do, why it is now insufficient, and what observable task this chapter will solve.
- Keep the opening context compact: one chapter-number eyebrow, one title, one introductory argument, then a single context block that combines prerequisites with the concrete neighboring-chapter sequence. Do not add a separate part banner, phase slogan, or second introduction.
- Write major headings as concrete teaching claims or mechanisms with a visible actor and action. Reject headings that sound like internal outline labels, taxonomies, or stacked abstractions such as “unified framework”, “objective-equation transformation”, or “general methodological perspective”.
- Derive before naming. Begin with the running example, expose the missing quantity or failed operation, derive the replacement, and only then attach the standard algorithm or theorem name.
- Let a later abstraction reuse the exact symbols, residual, trajectory, table, or update already established by the concrete example. The abstraction must feel like a change of scope, not a change of subject.
- Keep supporting derivations, worked checks, algorithms, comparisons, and experiments inside the surrounding argument. Their labels may aid navigation, but they must not restart the chapter or repeat its motivation.
- Before each named algorithm, verify that the preceding prose has established its input, target, observable evidence, update, and need. After it, show one worked consequence and the remaining tradeoff before moving on.
- Place the experiment only after the chapter has made a falsifiable claim. The experiment must expose the internal variables used in the derivation and compare one controlled alternative on the same evidence.
- End by synthesizing only mechanisms that the reader has already derived. State the precise unresolved limitation that supplies the next chapter's opening problem.
- Apply this standard to Chinese and English independently. Structural equivalence is required; translated sentence shape is not.

## Heading Density and Natural Chinese

- Place headings only at genuine conceptual turns. A heading must introduce a section that changes the problem, mathematical object, mechanism, or stage of the argument; it must not merely label the next paragraph, formula, example, or transition.
- Demoting a heading from `h2` to `h3`, changing its wording, or removing its number is not a prose refactor. If the same heading-plus-one-sentence rhythm remains, the chapter is still fragmented.
- A block containing only one or two short explanatory paragraphs, one supporting equation, one example, or one transition must not normally open a new visible heading. Merge its title into the surrounding paragraph as a natural lead sentence and keep the equation inside that paragraph's argument.
- Start a new visible heading only when the reader is entering a genuinely new problem, mathematical object, named theorem, complete algorithm, experiment, or stage of the proof. A label that merely describes the next sentence does not meet this threshold.
- Consecutive micro-blocks must be rewritten as connected paragraphs, not only wrapped in a shared container. Add explicit causal handoffs so that each paragraph begins from the result or limitation established by the previous one.
- During review, count visible headings whose body ends after one paragraph or one supporting formula. Each instance requires a written justification; otherwise merge it into continuous prose.
- Treat three to five level-two headings in an ordinary chapter as a useful diagnostic range, not a quota. Named algorithm variants, theorems, and experiments may use subordinate headings when the distinction carries teaching meaning.
- Embed calculations, comparison tables, derivations, and interactive evidence inside the surrounding argument. Their captions or interface labels must not make the article appear to restart.
- Never repair a question-heavy outline by mechanically converting every question into an abstract noun phrase. Formal exposition still needs concrete subjects, verbs, and causal sentences.
- Write Chinese and English independently from the same conceptual outline. Preserve definitions, formulas, evidence, and sequence across languages, but do not mirror English word order or nominalization in Chinese.
- In Chinese, prefer a concrete actor and action over stacked abstractions. Introduce a standard English term once in parentheses when useful, then use the established Chinese term consistently unless the English name is the conventional algorithm label.
- Do not translate editorial abstractions literally into Chinese. Phrases such as "matched comparison", "same budget decomposition", "objective transformation", or "information span" must be rewritten around a concrete reader-visible action: what is held fixed, what is observed, and what conclusion follows.
- Read every edited Chinese paragraph aloud as ordinary technical Chinese. Reject missing subjects, excessive nominalization, stacked "在……下进行……" constructions, and sentences whose logical relation depends on an English source order.
- Diagnose fragmentation by reading the prose with all headings removed and by listing headings without body copy. The prose must still form a continuous argument, while the heading list must resemble a compact conceptual outline rather than a table of paragraph labels.
- Reject a refactor that changes only heading tags or CSS. The rendered article and its source data must show fewer restarts, longer connected paragraphs, and explicit transitions between equations, evidence, and conclusions.

## Prose Sufficiency and Segmentation Gate

- Require every main-path prose block to establish a concrete situation or observation, explain the mechanism or causal relation, and state the consequence or remaining tradeoff. A heading followed by one compressed or abstract sentence is incomplete even when its typography looks continuous.
- When comparing methods, name the actual comparison axes in the prose: what evidence each method uses, when that evidence becomes available, what estimate depends on the current value function, and how bias, variance, memory, or task assumptions change. Do not replace these facts with editorial slogans such as "fair comparison" or "same-budget decomposition".
- Preserve the operational distinctions carried by the source. For Monte Carlo and temporal-difference learning, for example, state whether an episode must terminate, whether bootstrapping is used, when updates occur, and what information enters each target before summarizing their tradeoff.
- Expand, merge, or remove any ordinary article block that contains fewer than two complete explanatory sentences. Keep a shorter block only when it is a self-contained definition, theorem statement, algorithm step, caption, or deliberate transition whose meaning is already established by the adjacent prose.
- Audit visible borders and separators on article-level prose, transitions, handoffs, and deepening sections. Ordinary exposition must be connected by language and spacing; a horizontal rule must represent a real semantic or interface boundary.
- Read the Chinese body once with headings, labels, and visual separators mentally removed. The mechanism and progression must remain understandable from the sentences themselves rather than from readers inferring meaning from section names.

## Formula Visual-Hierarchy Contract

- Treat equations as part of the article's grammar. Keep short symbols and relations inline, and use display math only when an equation needs an independent reading step or belongs to a visible derivation.
- Do not give ordinary supporting equations a persistent tinted background, quotation-style left border, card shell, or other callout chrome by default. Repeated formula callouts visually fragment the article even when the prose is continuous.
- Reserve tinted or bordered emphasis for genuinely exceptional semantics such as a theorem, a convergence condition, a warning, a counterexample, or the one result the surrounding argument is proving.
- Present consecutive transformations as one aligned derivation chain. Do not split each equality or closely related formula into separate visual islands.
- Let clickable derivations remain article-native: use restrained hover, focus, or selected-line treatment while keeping the unselected chain visually quiet and continuous.
- For every chapter, classify each displayed formula as derivation, definition, result, condition, worked calculation, or supporting relation. If its visual weight exceeds its teaching role, demote it to inline or plain display math.
- Review the page at normal reading scale and reject any rhythm in which alternating prose and formula boxes makes the reader repeatedly enter and exit independent components.
- Do not use horizontal rules to manufacture structure between ordinary prose paragraphs. A rule is allowed only when it belongs to a real interface boundary, table, algorithm ledger, theorem, derivation step list, or reference section; it must not substitute for a textual transition.

## Experiment-as-Argument Contract

- Place the experiment after a concrete claim or tradeoff and ask the reader to predict the result before manipulating controls.
- Expose the algorithm-specific causal state needed to explain the result. For stochastic approximation, for example, show observation, current estimate, residual, step size, correction, next estimate, and historical weighting rather than only a final curve.
- Synchronize the running example, derivation symbols, controls, visible algorithm state, and post-experiment interpretation. The experiment must continue the same argument instead of opening a parallel mini-product.
- Include a counterfactual comparison that changes one mechanism while holding the evidence stream fixed whenever randomness or data order matters.
- Reject an experiment that answers only "what happened". The visible state must also let the reader explain why it happened and which assumption or tradeoff caused it.
- Do not reuse a generic slider-chart-metrics shell when it hides the chapter's distinctive data flow, update timing, memory, target construction, or policy change.

## Content-Organization Review

For every chapter review, record:

1. the unresolved opening problem;
2. the causal spine in reader-visible order;
3. first-use violations and premature synthesis;
4. repeated restarts, freely reorderable blocks, and missing handoffs;
5. the running example and whether it persists across prose, mathematics, and interaction;
6. each display formula's teaching role and whether its visual weight is justified;
7. what the experiment exposes internally, what it hides, and whether it supplies a controlled counterfactual;
8. the final synthesis and the precise limitation that motivates the next chapter.

Rate each chapter separately for conceptual sequence, causal continuity, mathematical integration, example continuity, experiment fidelity, and visual hierarchy. Do not merge these dimensions into one vague quality score. Produce a prioritized repair list before editing.

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
- Keep the desktop reading column broad enough for technical prose and derivations. In this product, use the shared 920 px reading-column token when the chapter frame has room; let it contract responsively instead of assigning narrower per-section widths.
- Place experiments as intentional wide regions inside the same chapter shell. Their outer edges must follow the shared grid, and entry/exit copy must return to the same text column.
- Treat phase navigation and chapter-position indicators as orientation, not a second introduction. Do not repeat the chapter motivation immediately below the header; combine the phase label and neighboring chapter sequence into a compact path when the opening already supplies the rationale.
- Do not stack an isolated prerequisite line and an abstract phase banner at the chapter opening. When both are useful, combine the prerequisite and concrete neighboring-chapter sequence into one compact context block; omit internal phase labels that do not help the reader understand the next paragraph.
- Do not create a narrow-wide-narrow rhythm merely because components have different `max-width` values.
- Render supporting equations compactly near the prose. Use display math only when the equation needs its own reading step; do not enlarge every formula or force each short expression onto a separate row.
- Split genuinely long equations into semantic `aligned` rows before adding horizontal scrolling. At desktop width, article derivations and primary experiment equations must not show an inner scrollbar merely because a container was made too narrow.
- Inspect adjacent block edges and vertical rhythm in rendered desktop and mobile output, not only individual components.

## Readability and Reference Contract

- Use the shared semantic typography tokens as the only source of reader-facing small type: `--font-floor` and `--font-dense` are at least 12 px, `--font-ui` is at least 13 px, and explanatory copy, pseudocode, worked-example tables, and code use at least 14 px. Article prose remains at least 14 px.
- Never author a reader-facing `font-size` or `font` shorthand below 12 px (`.75rem` at the 16 px root), including inside `clamp()`. Decorative geometry may be smaller only when it contains no text.
- Apply the floor to pseudocode, algorithm comparisons, worked-example tables, transition/handoff explanations, ledgers, controls, chart labels, inspectors, navigation, and the right workbench. If larger text no longer fits, add wrapping, scrolling, or a responsive layout instead of reducing the type again.
- Traverse every chapter in Chinese and English at desktop and mobile widths and inspect computed font sizes. Zero reader-visible elements below 12 px is the release condition; do not approve a component from CSS declarations or representative samples alone.
- Keep interaction CSS structurally scoped. Never use a broad descendant selector such as `.component span` for a step badge, label, or token when `MathText` or KaTeX may add nested spans; target a direct child or a dedicated class instead.
- Treat every `MathFormula` boundary as third-party nested markup: structural rules must stop at the wrapper, and no component rule may position, size, pad, grid, or flex arbitrary descendant `span` nodes inside it.
- Keep rendered formulas inside interactions at least 12 px at normal reading size. Formula tables, operator summaries, update ledgers, and control labels must wrap or own an explicit inner horizontal scroll surface instead of shrinking below that floor. Exclude KaTeX's internal layout spans from the audit, but measure the `.math-formula` wrapper itself.
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
- List every main-path prose block with fewer than two complete explanatory sentences. Expand or merge it unless it qualifies for one of the explicit short-block exceptions.
- For every method comparison, record the concrete axes stated in the prose and reject abstract claims that do not identify what is held fixed, what evidence is available, and what outcome is being compared.
- Audit borders and horizontal rules on article-level prose classes. Reject separators whose only purpose is to compensate for a missing textual transition.
- Compare the completed chapter against its source-coverage matrix and fail it if any required algorithm, variant, theorem condition, comparison, pseudocode stage, or worked example lacks a visible destination.
- For every named algorithm, confirm that the reader can identify the limitation that motivated it, its complete execution loop, why its update is valid, and its tradeoff relative to the previous method.
- Reject generic experiments whose visible state does not correspond to the chapter's actual algorithm state and data flow.
- Measure the rendered left and right edges of the opening, representative prose, experiment entry, post-experiment interpretation, summary, and references. Confirm they use the same chapter grid and text column rather than unrelated widths.
- Measure every algorithm, pseudocode, worked-example table, experiment inspector, and right-workbench text surface on desktop and mobile. Reject any value below the readability floor unless a documented graphical exception remains legible at actual size; a single representative sample cannot close a site-wide typography issue.
- Confirm each chapter ends with one source section and no separate concept-source footer.
