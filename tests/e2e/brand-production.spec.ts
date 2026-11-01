import { expect, test } from "@playwright/test";
import { catalogue, sectionData } from "../../src/lib/platform";

test("illustrated emblem appears in header, footer and icon", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".brand-logo__lockup img")).toHaveAttribute(
    "src",
    /emblem-premium-heritage\.svg/,
  );
  await expect(page.locator(".platform-footer__brand img")).toHaveAttribute(
    "src",
    /emblem-premium-heritage\.svg/,
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /icon\.png|emblem-premium-heritage-216\.png/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".brand-logo__symbol img")).toBeVisible();
});

test("approved original emblem is consistent across every frontend page", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const routes = [
    "/",
    "/shop/",
    "/contact/",
    "/privacy/",
    ...Object.keys(sectionData).map((section) => `/${section}/`),
    ...catalogue.map((item) => `/shop/${item.slug}/`),
  ];
  for (const route of [...new Set(routes)]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    const logos = page.locator(".illustrated-lockup img");
    for (const image of await logos.all()) {
      await expect(image).toHaveAttribute(
        "src",
        /emblem-premium-heritage\.svg/,
      );
      if (await image.isVisible()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (element: HTMLImageElement) =>
                element.complete && element.naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
    }
    await expect(page.locator(".site-header .header-contact")).toHaveAttribute(
      "href",
      "/contact/",
    );
  }
  await page.goto("/");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({
      path: `docs/approved-logo-implementation/screenshots/website-${width}.png`,
    });
    await page.locator(".site-header").screenshot({
      path: `docs/approved-logo-implementation/screenshots/header-${width}.png`,
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator(".platform-footer").screenshot({
    path: "docs/approved-logo-implementation/screenshots/footer.png",
  });
});
