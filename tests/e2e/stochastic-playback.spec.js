import { expect, test } from '@playwright/test'

test('stochastic-approximation playback survives batch and preset changes', async ({ page }) => {
  const runtimeErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  await page.route('https://api.github.com/repos/skyliulu/RL-Foundations-Lab', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ stargazers_count: 0 }),
  }))

  await page.goto('/')
  await page.locator('.left-nav nav > button').nth(7).click()

  const lab = page.locator('.sa-lab')
  const presets = lab.locator('.sa-demo-presets button')
  const batchButtons = lab.locator('.sa-controls fieldset').nth(1).getByRole('button')
  const autoPlay = lab.locator('.sa-playback-buttons .is-primary')
  const currentUpdate = lab.locator('.sa-step-selector output')

  await presets.nth(1).click()
  await autoPlay.click()
  await expect(currentUpdate).not.toHaveText('1 / 8', { timeout: 2500 })
  await batchButtons.getByText('5', { exact: true }).click()
  await expect(currentUpdate).toHaveText('1 / 1')
  await expect(autoPlay).toHaveText(/自动播放|Auto play/)

  await presets.nth(1).click()
  await autoPlay.click()
  await expect(currentUpdate).not.toHaveText('1 / 8', { timeout: 2500 })
  await presets.nth(0).click()
  await expect(currentUpdate).toHaveText('1 / 36')
  await expect(autoPlay).toHaveText(/自动播放|Auto play/)
  await expect(lab).toBeVisible()

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await presets.nth(1).click()
  await autoPlay.click()
  await expect(currentUpdate).not.toHaveText('1 / 8', { timeout: 2500 })
  await batchButtons.getByText('5', { exact: true }).click()
  await expect(currentUpdate).toHaveText('1 / 1')
  await expect(autoPlay).toHaveText('Auto play')
  await expect(lab).toBeVisible()

  expect(runtimeErrors).toEqual([])
})
