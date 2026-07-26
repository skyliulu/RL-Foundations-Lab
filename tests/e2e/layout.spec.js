import { expect, test } from '@playwright/test'

const runtimeErrors = new WeakMap()
const edgeTolerance = 1

test.beforeEach(async ({ page }) => {
  const errors = []
  runtimeErrors.set(page, errors)
  await page.route('https://api.github.com/repos/skyliulu/RL-Foundations-Lab', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ stargazers_count: 0 }),
  }))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
})

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([])
})

async function expectSameHorizontalEdges(page, selectors) {
  const boxes = await page.locator(selectors.join(', ')).evaluateAll((elements, requestedSelectors) => {
    return requestedSelectors.map((selector) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return { selector, left: rect.left, right: rect.right, width: rect.width }
    })
  }, selectors)

  for (const box of boxes) expect(box, `missing ${box?.selector || 'layout target'}`).not.toBeNull()
  const [reference, ...comparisons] = boxes
  for (const box of comparisons) {
    expect(Math.abs(box.left - reference.left), `${box.selector} left edge`).toBeLessThanOrEqual(edgeTolerance)
    expect(Math.abs(box.right - reference.right), `${box.selector} right edge`).toBeLessThanOrEqual(edgeTolerance)
  }
}

async function expectHomeAlignment(page) {
  await expect(page.locator('.course-home')).toBeVisible()
  await expectSameHorizontalEdges(page, [
    '.course-home',
    '.home-hero',
    '.home-hero h1',
    '.home-hero > p',
    '.learning-map',
  ])
}

async function expectEveryChapterAlignment(page) {
  const navigation = page.locator('.left-nav nav > button')
  await expect(navigation).toHaveCount(22)

  for (let index = 1; index < 22; index += 1) {
    await navigation.nth(index).click()
    await expect(page.locator('.chapter-header')).toBeVisible()
    const bodySelector = await page.locator(
      '.mdp-narrative, .chapter-article-sections, .mc-reasoning-path, .article-flow-block',
    ).first().evaluate((element) => {
      if (element.classList.contains('mdp-narrative')) return '.mdp-narrative'
      if (element.classList.contains('chapter-article-sections')) return '.chapter-article-sections'
      if (element.classList.contains('mc-reasoning-path')) return '.mc-reasoning-path'
      return '.article-flow-block'
    })
    await expectSameHorizontalEdges(page, [
      '.chapter-header',
      '.chapter-header h1',
      '.chapter-intro',
      '.chapter-continuity',
      bodySelector,
    ])
  }
}

test('course entry and all 21 chapter openings share one reading width in both languages', async ({ page }) => {
  await page.goto('/')
  await expectHomeAlignment(page)
  await expectEveryChapterAlignment(page)

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.locator('.home-nav-item').click()
  await expectHomeAlignment(page)
  await expectEveryChapterAlignment(page)
})
