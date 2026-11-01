import { test, expect } from "@playwright/test";

for (const [route, heading] of [
  ["wholesale", "Product or wholesale enquiry"],
  ["artisans", "Artisan participation enquiry"],
  ["impact", "Partnership enquiry"],
  ["collaborate", "Expert collaboration enquiry"],
  ["contact", "General enquiry"],
]) {
  test(`${route}: form validation and responsive presentation`, async ({
    page,
  }) => {
    await page.goto(`/${route}/`);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    const form = page.locator(".tt-enquiry form");
    expect(
      await form.evaluate((element: HTMLFormElement) =>
        element.checkValidity(),
      ),
    ).toBe(false);
    await page.locator('input[name="name"]').fill("Synthetic validation test");
    await page.locator('input[name="email"]').fill("invalid-email");
    expect(
      await page
        .locator('input[name="email"]')
        .evaluate((element: HTMLInputElement) => element.validity.typeMismatch),
    ).toBe(true);
    for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const size = await page
        .getByRole("button", { name: "Send enquiry" })
        .boundingBox();
      expect(size?.height).toBeGreaterThanOrEqual(44);
    }
  });
}
