import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders every required homepage landmark", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Handmade in Thar/i }),
  ).toBeVisible();
  await expect(page.getByText("Shop by mood")).toBeVisible();
  await expect(page.getByText("Every stitch has a maker.")).toBeVisible();
  await expect(page.getByText("Pieces with presence")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Look closer." }),
  ).toBeVisible();
  await expect(page.getByText(/Styled for the city/i)).toBeVisible();
  await expect(page.getByText(/The women/i).first()).toBeVisible();
  await expect(page.getByText("A piece takes shape")).toBeVisible();
  await expect(page.getByText("Tharparkar").first()).toBeVisible();
  await expect(page.getByText("Real trade, not charity")).toBeVisible();
  await expect(page.getByText("Impact & research").first()).toBeVisible();
  await expect(
    page.getByText("Original craft for modern retail."),
  ).toBeVisible();
  await expect(page.getByText("The journal")).toBeVisible();
  await expect(page.getByText("Letters from Thar")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

test("mobile navigation opens, closes, and exposes primary links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open menu" }).click();

  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Our Craft/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

for (const mobile of [
  { name: "iphone", width: 390, height: 844 },
  { name: "android", width: 412, height: 915 },
]) {
  test(`${mobile.name} menu covers the viewport and preserves scroll position`, async ({
    page,
  }) => {
    await page.setViewportSize(mobile);
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveCSS("min-width", "44px");
    await expect(trigger).toHaveCSS("min-height", "44px");
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2),
    );
    const scrollPosition = await page.evaluate(() => window.scrollY);

    await trigger.click();

    const shell = page.locator(".mobile-menu-shell");
    await expect(shell).toBeVisible();
    const bounds = await shell.boundingBox();
    expect(bounds?.y).toBe(0);
    expect(bounds?.height).toBeGreaterThanOrEqual(mobile.height);
    await expect(page.locator("body")).toHaveCSS("position", "fixed");

    await page.locator(".mobile-menu-top .icon-button").click();
    await expect(shell).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBe(scrollPosition);
  });
}

test("has no serious or critical automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const highSeverity = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(highSeverity).toEqual([]);
});

test("internal fragment links resolve to existing targets", async ({
  page,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")).filter(Boolean),
    );

  for (const href of new Set(hrefs)) {
    if (href === "#") continue;
    await expect(page.locator(href as string).first()).toHaveCount(1);
  }
});

test("metadata, local images, and reduced motion are valid", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => {
      (image as HTMLImageElement).loading = "eager";
    });
  });
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(
    "Thar Textiles | Handmade Fashion from Tharparkar",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /women-led contemporary fashion and textile brand/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https:\/\/thartextiles\.co\/?$/,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /^https:\/\/thartextiles\.co\/?$/,
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    /Handmade Fashion from Tharparkar/,
  );

  const organisationSchema = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(JSON.parse(organisationSchema ?? "{}")).toMatchObject({
    "@type": "Organization",
    name: "Thar Textiles",
    url: "https://thartextiles.co",
    email: "hello@thartextiles.co",
  });

  const brokenImages = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter(
          (image) =>
            !(image as HTMLImageElement).complete ||
            (image as HTMLImageElement).naturalWidth === 0,
        )
        .map((image) => (image as HTMLImageElement).currentSrc),
    );
  expect(brokenImages).toEqual([]);

  const mailtoLinks = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(mailtoLinks.length).toBeGreaterThan(0);
  expect(
    mailtoLinks.every((href) =>
      href?.startsWith("mailto:hello@thartextiles.co"),
    ),
  ).toBe(true);

  const orbitDuration = await page
    .locator(".hero-orbit")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(orbitDuration)).toBeLessThanOrEqual(0.01);
});

test("publishes customer-facing copy and functional enquiry routes", async ({
  page,
}) => {
  await page.goto("/");

  for (const internalPhrase of [
    "Campaign photography in development",
    "Photography brief",
    "Required for final publication",
    "Attribution pending verification and consent",
    "Landscape photography commission pending",
    "Editorial commissioning brief",
    "submission is not connected",
    "commerce connection pending",
  ]) {
    await expect(page.getByText(internalPhrase, { exact: false })).toHaveCount(
      0,
    );
  }

  await expect(
    page.getByRole("link", { name: "Enquire about a piece by email" }),
  ).toHaveAttribute("href", /^mailto:hello@thartextiles\.co\?subject=/);
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "required",
    "",
  );
  await expect(
    page.getByRole("button", { name: "Join by email" }),
  ).toBeVisible();
});

test("publishes official robots, sitemap, and manifest details", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(
    "Sitemap: https://thartextiles.co/sitemap.xml",
  );

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("<loc>https://thartextiles.co</loc>");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: "Thar Textiles",
    short_name: "Thar Textiles",
  });
});

test("records a local performance baseline", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __cls: number; __lcp: number }).__cls = 0;
    (window as typeof window & { __cls: number; __lcp: number }).__lcp = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) {
          (window as typeof window & { __cls: number; __lcp: number }).__cls +=
            shift.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries.at(-1);
      if (last) {
        (window as typeof window & { __cls: number; __lcp: number }).__lcp =
          last.startTime;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const baseline = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    const state = window as typeof window & { __cls: number; __lcp: number };
    return {
      cls: state.__cls,
      domContentLoaded: navigation.domContentLoadedEventEnd,
      lcp: state.__lcp,
      resourceBytes: resources.reduce(
        (total, resource) => total + resource.transferSize,
        0,
      ),
      resourceCount: resources.length,
    };
  });

  console.log("PERFORMANCE_BASELINE", JSON.stringify(baseline));
  expect(baseline.cls).toBeLessThanOrEqual(0.1);
  expect(baseline.lcp).toBeGreaterThan(0);
});

for (const viewport of [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "wide-1728", width: 1728, height: 1080 },
]) {
  test(`captures ${viewport.name} visual review`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      fullPage: true,
      path: `docs/screenshots/homepage-${viewport.name}.png`,
    });
  });
}
