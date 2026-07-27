import { expect, test } from '@playwright/test'

const foundationChapterIndices = [1, 2, 3, 4]

async function formulaLikeTextOutsideMathFormula(page) {
  return page.locator('.chapter-shell').evaluate((root) => {
    const formulaLike = /[₀-₉ₐₛₜₖ⁰-⁹²³ᵏʳᵗ𝒜𝒮πγδϵεθλρσφμΔΣ∞≈≤≥≠∈∑]|(?:[VQGSRAP]\*?\([^)]*\))|(?:[Tt]\*?[π]?V\([^)]*\))/
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

test('chapters 1–4 render every formula-like text run through MathFormula in both languages', async ({ page }) => {
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
    }
  }

  expect(allViolations).toEqual([])
})
