import { expect, test } from '@playwright/test'

const foundationChapterIndices = [1, 2, 3, 4, 5]

async function formulaLikeTextOutsideMathFormula(page) {
  return page.locator('.chapter-shell').evaluate((root) => {
    const formulaLike = /[₀-₉ₐₛₜₖ⁰-⁹²³ᵏʳᵗ𝒜𝒮πγδϵεθλρσφμΔΣ∞≈≤≥≠∈∑]|(?:[VQGSRAP]\*?\([^)]*\))|(?:[Tt]\*?[π]?V\([^)]*\))|(?:[TV]\^\*)|(?:V_[A-Za-z0-9{}]+)|(?:[jk]\s*=)|(?:max\s*\|V)|(?:V[−-]V\*)/
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const violations = []
    let node = walker.nextNode()

    while (node) {
      const value = node.nodeValue.trim()
      const parent = node.parentElement
      if (
        value
        && formulaLike.test(value)
        && !parent.closest('.math-formula')
        && !parent.closest('[aria-hidden="true"]')
      ) {
        violations.push({
          value,
          parent: parent.tagName.toLowerCase(),
          className: parent.className,
        })
      }
      node = walker.nextNode()
    }

    return violations.slice(0, 50)
  })
}

test('chapters 1–5 render every formula-like text run through MathFormula in both languages', async ({ page }) => {
  const runtimeErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))

  await page.route('https://api.github.com/repos/skyliulu/RL-Foundations-Lab', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ stargazers_count: 0 }),
  }))
  await page.goto('/')
  const allViolations = []

  for (const language of ['zh', 'en']) {
    if (language === 'en') {
      await page.getByRole('button', { name: 'EN', exact: true }).click()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    }

    const navigation = page.locator('.left-nav nav > button')
    await expect(navigation).toHaveCount(22)
    for (const index of foundationChapterIndices) {
      await navigation.nth(index).click()
      await expect(page.locator('.chapter-shell')).toBeVisible()
      const violations = await formulaLikeTextOutsideMathFormula(page)
      if (violations.length) allViolations.push({ language, chapter: index, violations })
      await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
      if (index === 5) {
        const primaryFormulaOverflow = await page.locator('.chapter-shell').evaluate((root) => (
          [...root.querySelectorAll('.math-formula')]
            .filter((element) => !element.closest('.deepening-example-scroll'))
            .filter((element) => element.scrollWidth > element.clientWidth + 2)
            .map((element) => ({
              latex: element.getAttribute('data-latex'),
              className: element.className,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            }))
        ))
        expect(primaryFormulaOverflow).toEqual([])
      }
    }
  }

  expect(allViolations).toEqual([])
  expect(runtimeErrors).toEqual([])
})

test('interactive non-default states and GRPO controls render math cleanly without overflow', async ({ page }) => {
  test.setTimeout(120_000)
  const runtimeErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))

  await page.route('https://api.github.com/repos/skyliulu/RL-Foundations-Lab', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ stargazers_count: 0 }),
  }))
  await page.goto('/')

  const navigation = page.locator('.left-nav nav > button')

  for (const language of ['zh', 'en']) {
    if (language === 'en') {
      await page.getByRole('button', { name: 'EN', exact: true }).click()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    }

    // Chapter 9: Sarsa vs Q-learning exploration presets and fork-jump button work without overflow
    await navigation.nth(9).click()
    await expect(page.locator('.control-presets > button')).toHaveCount(2)
    await page.locator('.control-presets > button').nth(1).click()
    await page.locator('.control-playback-actions').getByRole('button', { name: language === 'zh' ? '跳到探索分歧帧' : 'Next fork', exact: true }).click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)

    // Chapter 10: VFA shared 5x5 grid, playback, weight ledger, and scenario switch work without overflow
    await navigation.nth(10).click()
    await expect(page.locator('.vfa-course-grid')).toBeVisible()
    await expect(page.locator('.vfa-weight-ledger')).toBeVisible()
    await expect(page.locator('.vfa-state-strip')).toBeVisible()
    await expect(page.locator('.vfa-state-strip [data-latex="s_{13}"]')).toBeVisible()
    await page.locator('.vfa-playback-actions').getByRole('button', { name: language === 'zh' ? '下一步' : 'Next', exact: true }).click()
    await expect(page.locator('.vfa-warn-badge')).toBeVisible()
    await page.locator('.vfa-scenario-switch button').first().click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const vfaOverflow = await page.locator('.learning-lab-vfa').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(vfaOverflow.scrollWidth).toBeLessThanOrEqual(vfaOverflow.clientWidth + 2)

    // Chapter 11: DQN four ablation presets, staircase curve, replay buffer, and sync jump work without overflow
    await navigation.nth(11).click()
    await expect(page.locator('.dqn-curve-svg')).toBeVisible()
    await expect(page.locator('.dqn-ablation-presets > button')).toHaveCount(4)
    await page.locator('.dqn-ablation-presets > button').first().click()
    await page.locator('.dqn-ablation-presets > button').nth(3).click()
    await page.locator('.dqn-playback-actions').getByRole('button', { name: language === 'zh' ? '跳到下次同步' : 'Next sync', exact: true }).click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const dqnOverflow = await page.locator('.learning-lab-dqn').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(dqnOverflow.scrollWidth).toBeLessThanOrEqual(dqnOverflow.clientWidth + 2)

    // Chapter 12: Policy Gradient evolution counterfactual, baseline presets, and trajectory step switch work without overflow
    await navigation.nth(12).click()
    await expect(page.locator('.pg-evolution-svg')).toBeVisible()
    await expect(page.locator('.pg-gradient-ledger')).toBeVisible()
    await page.locator('.pg-baseline-presets > button').first().click()
    await page.locator('.pg-baseline-presets > button').nth(1).click()
    await page.locator('.pg-trajectory button').nth(2).click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const pgOverflow = await page.locator('.learning-lab-policygradient').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(pgOverflow.scrollWidth).toBeLessThanOrEqual(pgOverflow.clientWidth + 2)

    // Chapter 13: Actor-Critic two-timescale presets, dual curve, and playback work without overflow
    await navigation.nth(13).click()
    await expect(page.locator('.ac-curve-svg')).toBeVisible()
    await expect(page.locator('.ac-presets > button')).toHaveCount(3)
    await page.locator('.ac-presets > button').nth(1).click()
    await page.locator('.ac-presets > button').nth(2).click()
    await page.locator('.ac-playback-actions').getByRole('button', { name: language === 'zh' ? '下一步' : 'Next', exact: true }).click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const acOverflow = await page.locator('.learning-lab-actorcritic').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(acOverflow.scrollWidth).toBeLessThanOrEqual(acOverflow.clientWidth + 2)

    // Chapter 14: PPO presets, asymmetric boundary state, and 1D surrogate slice render cleanly without overflow
    await navigation.nth(14).click()
    await expect(page.locator('.ppo-surrogate-svg')).toBeVisible()
    await page.locator('.ppo-presets > button').nth(2).click()
    await expect(page.locator('.ppo-inspector')).toContainText(language === 'zh' ? '样本 B' : 'Sample B')
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const ppoOverflow = await page.locator('.ppo-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(ppoOverflow.scrollWidth).toBeLessThanOrEqual(ppoOverflow.clientWidth + 2)

    // Chapter 15: Token MDP microscope and truncated state render γV(s_T) via MathFormula
    await navigation.nth(15).click()
    await page.locator('.token-step-strip > button').nth(2).click()
    await expect(page.locator('.token-microscope-cards')).toBeVisible()
    await page.locator('.token-mdp-lab').getByRole('button', { name: language === 'zh' ? '长度截断' : 'Length truncation', exact: true }).click()
    await expect(page.locator('.token-mdp-lab footer .math-formula')).toBeVisible()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)

    // Chapter 16: RLHF fault injection and algorithm view render r_t and A_t via MathFormula
    await navigation.nth(16).click()
    await expect(page.locator('.rlhf-fault-presets > button')).toHaveCount(4)
    await page.locator('.rlhf-fault-presets > button').nth(1).click()
    await expect(page.locator('.rlhf-fault-banner.is-alert')).toBeVisible()
    await page.locator('.system-lab').getByRole('button', { name: language === 'zh' ? '算法视图' : 'Algorithm view', exact: true }).click()
    await expect(page.locator('.algorithm-columns')).toBeVisible()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)

    // Chapter 17: DPO presets, likelihood displacement alert, and margin curve render cleanly without overflow
    await navigation.nth(17).click()
    await expect(page.locator('.dpo-curve-svg')).toBeVisible()
    await page.locator('.dpo-presets > button').nth(1).click()
    await expect(page.locator('.dpo-displacement-alert')).toBeVisible()
    await expect(page.locator('.dpo-update-ledger')).toBeVisible()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const dpoOverflow = await page.locator('.modern-extension-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(dpoOverflow.scrollWidth).toBeLessThanOrEqual(dpoOverflow.clientWidth + 2)

    // Chapter 18: GRPO group size, Clip-Higher, advantage bars, and dynamic sampling filter controls work without overflow
    await navigation.nth(18).click()
    await expect(page.locator('.grpo-adv-row')).toHaveCount(4)
    await expect(page.locator('.grpo-group-responses > article')).toHaveCount(4)
    await page.locator('.grpo-clip-higher-toggle button').click()
    await expect(page.locator('.grpo-unlock-tag').first()).toBeVisible()
    await page.locator('.grpo-size-segmented button').nth(3).click()
    await expect(page.locator('.grpo-group-responses > article')).toHaveCount(8)
    await page.locator('.modern-extension-lab').getByRole('button', { name: language === 'zh' ? '全对' : 'All right', exact: true }).click()
    await page.locator('.grpo-filter-toggle button').click()
    await expect(page.locator('.grpo-group-responses > article.is-skipped')).toHaveCount(8)
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)

    const grpoOverflow = await page.locator('.modern-extension-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(grpoOverflow.scrollWidth).toBeLessThanOrEqual(grpoOverflow.clientWidth + 2)

    // Chapter 19: Coding RL clickable repair tape and hidden-test gap render cleanly without overflow
    await navigation.nth(19).click()
    await page.locator('.coding-repair-tape > button').nth(1).click()
    await page.locator('.modern-extension-lab').getByRole('button', { name: language === 'zh' ? '显示隐藏测试' : 'Reveal hidden tests', exact: true }).click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const codingOverflow = await page.locator('.modern-extension-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(codingOverflow.scrollWidth).toBeLessThanOrEqual(codingOverflow.clientWidth + 2)

    // Chapter 20: Agent MDP clickable branch tree and boundary inspector work without overflow
    await navigation.nth(20).click()
    await expect(page.locator('.agent-node-inspector')).toBeVisible()
    await page.locator('.agent-tree-node.is-alternative').first().click()
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const agentOverflow = await page.locator('.modern-extension-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(agentOverflow.scrollWidth).toBeLessThanOrEqual(agentOverflow.clientWidth + 2)

    // Chapter 21: Credit assignment clickable bars and five-scheme comparison work without overflow
    await navigation.nth(21).click()
    await page.locator('.credit-bar-step').nth(2).click()
    await expect(page.locator('.credit-compare-grid > div')).toHaveCount(5)
    expect(await formulaLikeTextOutsideMathFormula(page)).toEqual([])
    await expect(page.locator('.chapter-shell .katex-error')).toHaveCount(0)
    const creditOverflow = await page.locator('.modern-extension-lab').evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(creditOverflow.scrollWidth).toBeLessThanOrEqual(creditOverflow.clientWidth + 2)
  }

  expect(runtimeErrors).toEqual([])
})
