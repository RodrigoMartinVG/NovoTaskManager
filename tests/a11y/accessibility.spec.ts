import { expect, test, type Page } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

const WCAG_OPTIONS = {
  detailedReport: true,
  detailedReportOptions: {
    html: true,
  },
  axeOptions: {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa'],
    },
  },
}

async function completeOnboardingWithSample(page: Page): Promise<void> {
  const startButton = page.getByRole('button', { name: /Empezar/ })
  if (!(await startButton.isVisible().catch(() => false))) {
    return
  }

  await startButton.click()
  await page.getByRole('button', { name: /Continuar/ }).click()

  const sampleButton = page.getByRole('button', { name: /Explorar con datos/i })
  await sampleButton.click()
}

async function closeHelpIfOpen(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: 'Cerrar' })
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click()
  }
}

async function goToView(page: Page, viewName: string): Promise<void> {
  await page.getByRole('button', { name: viewName, exact: true }).click()
  await expect(page.getByRole('heading', { level: 2, name: viewName })).toBeVisible()
}

test.describe('Accessibility AA', () => {
  test('onboarding and core views pass WCAG 2 A/AA', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    await checkA11y(page, undefined, WCAG_OPTIONS)

    await completeOnboardingWithSample(page)
    await closeHelpIfOpen(page)

    const views = ['Hoy', 'Semana', 'Kanban', 'Backlog', 'Calendario', 'Materias']

    for (const view of views) {
      await goToView(page, view)
      await checkA11y(page, undefined, WCAG_OPTIONS)
    }
  })

  test('help modal and task modal are keyboard-closable and accessible', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    await completeOnboardingWithSample(page)

    await expect(page.getByRole('dialog', { name: /Guia de inicio/i })).toBeVisible()
    await checkA11y(page, '[role="dialog"]', WCAG_OPTIONS)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: /Guia de inicio/i })).toHaveCount(0)

    await goToView(page, 'Backlog')
    await page.locator('main button').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await checkA11y(page, '[role="dialog"]', WCAG_OPTIONS)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
