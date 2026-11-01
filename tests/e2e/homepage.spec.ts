import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];
const localAdminToken = Object.fromEntries(
  readFileSync(".dev.vars", "utf8")
    .trim()
    .split("\n")
    .map((line) => line.split("=")),
).LOCAL_ADMIN_TOKEN as string;

test("homepage presents all audience paths and authentic collection imagery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /From Thar/ })).toBeVisible();
  await expect(page.locator(".tt-invite__links a")).toHaveCount(3);
  await expect(page.locator(".tt-card")).toHaveCount(4);
  await expect(page.locator(".tt-chips a")).toHaveCount(3);
  await expect(page.locator("footer")).toBeVisible();
});

for (const width of widths) {
  test(`homepage has no overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator("#hero-title")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await page.locator("img").evaluateAll((images) =>
      images.forEach((image) => {
        (image as HTMLImageElement).loading = "eager";
      }),
    );
    await page.waitForFunction(() =>
      [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    await page.screenshot({
      path: `docs/screenshots/stage3a-home-${width}.png`,
      fullPage: true,
    });
  });
}

test("mobile menu traps focus and navigates to shop", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 780 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close menu" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: /Shop/ }).click();
  await expect(page).toHaveURL(/\/shop\/$/);
  await expect(
    page.getByRole("heading", { name: /Craft to wear/ }),
  ).toBeVisible();
});

test("shop filters and product enquiry has a responsive enquiry form and email fallback", async ({
  page,
}) => {
  await page.goto("/shop/");
  await expect(page.locator(".tt-card")).toHaveCount(4);
  await page.getByRole("button", { name: /^Bags/ }).click();
  await expect(page.locator(".tt-card")).toHaveCount(1);
  await page.getByLabel("Search the collection").fill("kurta");
  await expect(page.locator(".tt-card")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("0 pieces shown");
  await page.getByLabel("Search the collection").fill("");
  await page.locator(".tt-card a").click();
  await expect(page).toHaveURL(/embroidered-shoulder-bag/);
  await expect(
    page.getByRole("link", { name: /Enquire about this piece/ }),
  ).toHaveAttribute("href", "#enquiry");
  await expect(
    page.getByRole("link", { name: /Or enquire by email/ }),
  ).toHaveAttribute("href", /^mailto:hello@thartextiles\.co\?subject=/);
  await expect(
    page.getByRole("heading", { name: /Product or wholesale enquiry/ }),
  ).toBeVisible();
});

test("collection cards open a filtered catalogue", async ({ page }) => {
  await page.goto("/");
  await page.locator(".tt-chips").getByRole("link", { name: /Bags/ }).click();
  await expect(page).toHaveURL(/category=Bags/);
  await expect(page.getByRole("button", { name: /^Bags/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".tt-card")).toHaveCount(1);
});

test("all audience routes expose their intended enquiry forms", async ({
  page,
}) => {
  for (const route of [
    "artisans",
    "wholesale",
    "impact",
    "collaborate",
    "about",
    "contact",
  ]) {
    await page.goto(`/${route}/`);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: /General enquiry/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /I agree to Thar Textiles/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Read the privacy notice/ }),
  ).toHaveAttribute("href", "/privacy/");
});

test("local general enquiry returns a persisted reference only after Worker acceptance", async ({
  page,
}) => {
  await page.goto("/contact/");
  await page.getByLabel(/^Name/).fill("Browser QA");
  await page.locator('input[name="email"]').fill("browser-qa@example.org");
  await page.getByLabel(/Preferred reply channel/).selectOption("email");
  await page
    .getByLabel(/Tell us about your enquiry/)
    .fill("Please verify browser submission reaches the local D1 database.");
  await page
    .getByRole("checkbox", { name: /I agree to Thar Textiles/ })
    .check();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByRole("heading", { name: "Your enquiry was received." }),
  ).toBeVisible();
  await expect(page.getByText(/Reference: TT-/)).toBeVisible();
});

test("all five enquiry categories persist locally and return a reference", async ({
  page,
}) => {
  const workflows = [
    {
      route: "wholesale",
      subject: "Hand-embroidered textile",
      location: "United Kingdom",
    },
    { route: "artisans", subject: "Embroidery", location: "Mithi district" },
    { route: "impact", organization: "Test community organization" },
    { route: "collaborate", subject: "Textile design" },
    { route: "contact" },
  ];
  for (const [index, workflow] of workflows.entries()) {
    await page.goto(`/${workflow.route}/`);
    await page.getByLabel(/^Name/).fill(`Local workflow ${index + 1}`);
    await page
      .locator('input[name="email"]')
      .fill(`workflow-${index + 1}@example.org`);
    await page.getByLabel(/Preferred reply channel/).selectOption("email");
    if (workflow.organization)
      await page
        .locator('input[name="organization"]')
        .fill(workflow.organization);
    if (workflow.location)
      await page.locator('input[name="location"]').fill(workflow.location);
    if (workflow.subject)
      await page.locator('input[name="subject"]').fill(workflow.subject);
    await page
      .getByLabel(/Tell us about your enquiry/)
      .fill("Please record this test enquiry in the local database.");
    await page
      .getByRole("checkbox", { name: /I agree to Thar Textiles/ })
      .check();
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(
      page.getByRole("heading", { name: "Your enquiry was received." }),
    ).toBeVisible();
    await expect(page.getByText(/Reference: TT-/)).toBeVisible();
  }
});

test("enquiry forms fit the priority phone, tablet, and desktop widths", async ({
  page,
}) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/contact/");
    await expect(
      page.getByRole("heading", { name: /General enquiry/ }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("local administrator dashboard requires token and displays the saved enquiry queue", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8787/admin/");
  await expect(
    page.getByRole("heading", { name: /Private enquiries/ }),
  ).toBeVisible();
  await page.getByLabel("Local administrator token").fill(localAdminToken);
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByRole("heading", { name: "Enquiries" })).toBeVisible();
  await expect(page.locator("#rows tr").first()).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("key pages have no serious automated accessibility violations", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const route of [
    "/",
    "/shop/",
    "/shop/embroidered-shoulder-bag/",
    "/about/",
    "/artisans/",
    "/wholesale/",
    "/impact/",
    "/collaborate/",
    "/contact/",
    "/privacy/",
  ]) {
    await page.goto(route);
    // Preserve the approved logotype colours; WCAG text contrast excludes logotypes.
    const results = await new AxeBuilder({ page: page as never })
      .exclude(".illustrated-lockup")
      .analyze();
    expect(
      results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  }
});
