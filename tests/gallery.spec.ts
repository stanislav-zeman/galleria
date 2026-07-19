import { test, expect, type Page } from '@playwright/test';

// The very first click on a freshly loaded page can land just before Svelte
// finishes hydrating, in which case it has no effect. Retry it (only it —
// every later interaction on the same page is safe as a plain click) rather
// than waiting longer, since a dead click never becomes live just by polling.
async function firstClick(page: Page, name: string) {
	const button = page.getByRole('button', { name }).first();
	await expect(async () => {
		await button.click();
	}).toPass({ timeout: 10_000 });
}

async function openPhoto(page: Page, name: string) {
	const heading = page.getByRole('heading', { name, level: 3 });
	await expect(async () => {
		await firstClick(page, name);
		await expect(heading).toBeVisible({ timeout: 1000 });
	}).toPass({ timeout: 10_000 });
	return heading;
}

test.describe('gallery', () => {
	test('loads and shows photo tiles grouped by month', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'Galleria', level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'drift' }).first()).toBeVisible();
	});

	test('switches grid style', async ({ page }) => {
		await page.goto('/');

		const uniformBtn = page.getByRole('button', { name: 'Uniform' });
		await expect(async () => {
			await uniformBtn.click();
			await expect(uniformBtn).toHaveClass(/active/, { timeout: 1000 });
		}).toPass({ timeout: 10_000 });

		const masonryBtn = page.getByRole('button', { name: 'Masonry' });
		await masonryBtn.click();
		await expect(masonryBtn).toHaveClass(/active/);
	});

	test('opens a photo in the lightbox and closes it', async ({ page }) => {
		await page.goto('/');

		const lightbox = await openPhoto(page, 'Concrete Choir');

		await page.locator('button.lb-close').click();
		await expect(lightbox).not.toBeVisible();
	});

	test('closes the lightbox with Escape', async ({ page }) => {
		await page.goto('/');

		const lightbox = await openPhoto(page, 'Concrete Choir');

		await page.keyboard.press('Escape');
		await expect(lightbox).not.toBeVisible();
	});

	test('navigates between photos with the arrow buttons', async ({ page }) => {
		await page.goto('/');

		await openPhoto(page, 'Concrete Choir');
		const counter = page.locator('.lb-kicker');
		const initialCounter = await counter.textContent();

		await page.getByRole('button', { name: 'Next' }).click();
		await expect(counter).not.toHaveText(initialCounter ?? '');

		await page.getByRole('button', { name: 'Previous' }).click();
		await expect(counter).toHaveText(initialCounter ?? '');
	});
});
