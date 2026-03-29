import { expect, test, type Page } from '@playwright/test'

async function completeOnboardingWithSample(page: Page): Promise<void> {
  const startButton = page.getByRole('button', { name: /Empezar/ })
  if (!(await startButton.isVisible().catch(() => false))) {
    return
  }

  await startButton.click()
  await page.getByRole('button', { name: /Continuar/ }).click()
  await page.getByRole('button', { name: /Explorar con datos/i }).click()
}

async function closeHelpIfOpen(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: 'Cerrar' })
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click()
  }
}

test.describe('Visual regression', () => {
  test('captures onboarding and six main views', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('onboarding-step1.png', { fullPage: true })

    await completeOnboardingWithSample(page)
    await closeHelpIfOpen(page)

    const views = ['Hoy', 'Semana', 'Kanban', 'Backlog', 'Calendario', 'Materias']
    for (const view of views) {
      await page.getByRole('button', { name: view, exact: true }).click()
      await expect(page).toHaveScreenshot(`view-${view.toLowerCase()}.png`, { fullPage: true })
    }
  })
})
