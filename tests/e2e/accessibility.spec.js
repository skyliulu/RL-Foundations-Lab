import { expect, test } from '@playwright/test'

const runtimeErrors = new WeakMap()

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

async function openChapter(page, title) {
  await page.goto('/')
  const matches = page.getByRole('button', { name: new RegExp(title) })
  await matches.last().click()
  await expect(page.locator('h1')).toContainText(title)
}

async function expectNoPageOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }))
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport)
}

test('navigation and conditionally hidden MDP views expose keyboard state', async ({ page }) => {
  await openChapter(page, '强化学习的基本概念')

  const activeNav = page.locator('.left-nav nav button[aria-current="page"]')
  await expect(activeNav).toHaveCount(1)
  await expect(activeNav).toContainText('强化学习的基本概念')

  const contractToggle = page.locator('button[aria-controls="mdp-interface-strip"]')
  await expect(contractToggle).toHaveAttribute('aria-expanded', 'false')
  await contractToggle.focus()
  await page.keyboard.press('Enter')
  await expect(contractToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#mdp-interface-strip')).toBeVisible()

  const policyToggle = page.locator('button[aria-controls="course-world-grid"]')
  await expect(policyToggle).toHaveAttribute('aria-expanded', 'true')
  await policyToggle.focus()
  await page.keyboard.press('Space')
  await expect(policyToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.world-policy-arrow')).toHaveCount(0)

  await expectNoPageOverflow(page)
})

test('Return samples support pressed state, Enter/Space, focus, and hidden presets', async ({ page }) => {
  await openChapter(page, '回报与价值函数')

  const trajectoryMode = page.getByRole('button', { name: '查看一条轨迹', exact: true })
  const valueMode = page.getByRole('button', { name: '比较多条轨迹', exact: true })
  await expect(trajectoryMode).toHaveAttribute('aria-pressed', 'true')
  await valueMode.click()
  await expect(valueMode).toHaveAttribute('aria-pressed', 'true')
  await expect(trajectoryMode).toHaveAttribute('aria-pressed', 'false')

  const samples = page.locator('.return-trajectory-card')
  await page.getByRole('button', { name: '32', exact: true }).click()
  await expect(samples).toHaveCount(32)
  const trajectoryList = page.locator('.return-trajectory-list')
  expect(await trajectoryList.evaluate((element) => ({
    isScrollable: element.scrollHeight > element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
  }))).toEqual({ isScrollable: true, overflowY: 'auto' })
  const secondSample = samples.nth(1)
  await secondSample.focus()
  await page.keyboard.press('Space')
  await expect(secondSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.return-readout')).toContainText('#2')
  await expect(secondSample).toBeFocused()
  await expect(secondSample).toHaveClass(/is-selected/)

  const thirdSample = samples.nth(2)
  await thirdSample.focus()
  await page.keyboard.press('Enter')
  await expect(thirdSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.return-readout')).toContainText('#3')

  const lastSample = samples.nth(31)
  await lastSample.focus()
  await page.keyboard.press('Enter')
  await expect(lastSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.return-readout')).toContainText('#32')

  const presetsToggle = page.locator('button[aria-controls="return-presets"]')
  await presetsToggle.focus()
  await page.keyboard.press('Enter')
  await expect(presetsToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#return-presets')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(presetsToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#return-presets')).toHaveCount(0)

  await expectNoPageOverflow(page)
  expect(await page.locator('.return-observatory').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('PPO SVG samples expose equivalent mouse and keyboard selection', async ({ page }) => {
  await openChapter(page, 'Proximal Policy Optimization')

  const samples = page.locator('.sample-plane g[role="button"]')
  await expect(samples).toHaveCount(6)
  const secondSample = samples.nth(1)
  await expect(secondSample).toHaveAttribute('tabindex', '0')
  await secondSample.focus()
  await page.keyboard.press('Space')
  await expect(secondSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.ppo-inspector')).toContainText('样本 B')
  await expect(secondSample).toBeFocused()
  expect(await secondSample.locator('circle, rect').evaluate((element) => getComputedStyle(element).strokeWidth)).toBe('4px')

  const thirdSample = samples.nth(2)
  await thirdSample.focus()
  await page.keyboard.press('Enter')
  await expect(thirdSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.ppo-inspector')).toContainText('样本 C')

  await expectNoPageOverflow(page)
  const experiment = page.locator('.ppo-lab')
  expect(await experiment.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('English copy preserves the same Return keyboard and hidden-view contract', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: /Returns and Value Functions/ }).last().click()
  await expect(page.locator('h1')).toContainText('Returns and Value Functions')

  const valueMode = page.getByRole('button', { name: 'Compare possible futures', exact: true })
  await valueMode.click()
  await expect(valueMode).toHaveAttribute('aria-pressed', 'true')

  const secondSample = page.locator('.return-trajectory-card').nth(1)
  await expect(secondSample).toHaveAttribute('aria-label', /Selected trajectory 2/)
  await secondSample.focus()
  await page.keyboard.press('Enter')
  await expect(secondSample).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.return-readout')).toContainText('#2')

  const presetsToggle = page.locator('button[aria-controls="return-presets"]')
  await presetsToggle.focus()
  await page.keyboard.press('Space')
  await expect(presetsToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#return-presets')).toBeVisible()

  await expectNoPageOverflow(page)
})
