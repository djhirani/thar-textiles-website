import { expect, test } from "@playwright/test";

test("production header and footer use the owner-supplied identity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".brand-logo__lockup")).toBeVisible();
  await expect(page.locator(".brand-logo__symbol")).toBeHidden();
  await expect(
    page.locator(".brand-logo__lockup .owner-lockup__tagline"),
  ).toHaveText("Women Crafting Change");
  await expect(page.locator(".footer-mark img")).toHaveAttribute(
    "src",
    /owner-direction\/Logo-reference\.png/,
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/brand/owner-direction/favicon.svg",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".brand-logo__lockup")).toBeHidden();
  await expect(page.locator(".brand-logo__symbol")).toBeVisible();
});
