import { expect, test } from "@playwright/test";

const routes = [
  "shop",
  "artisans",
  "wholesale",
  "impact",
  "collaborate",
  "about",
  "contact",
];
for (const width of [320, 360, 375, 390, 430, 768, 1024, 1101, 1440]) {
  test(`shared header fits and navigation works at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const header = page.locator(".tt-header");
    await expect(
      header.getByRole("link", { name: "Thar Textiles home" }),
    ).toBeVisible();
    expect(await header.locator(".tt-brand img:visible").count()).toBe(1);
    // Phones keep the header to logo + menu; Enquire lives in the menu there.
    if (width >= 640)
      await expect(header.getByRole("link", { name: /Enquire/ })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    if (width < 1200) {
      const trigger = page.getByRole("button", { name: "Open menu" });
      await expect(trigger).toHaveText("Menu");
      expect(
        await trigger.evaluate((element) => getComputedStyle(element).color),
      ).toBe("rgb(31, 46, 87)");
      const size = await trigger.boundingBox();
      const brand = await header.locator(".tt-brand").boundingBox();
      expect(size!.height).toBeGreaterThanOrEqual(44);
      // Logo on the left, menu on the right, both inside the page gutter.
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(size!.x);
      expect(size!.x + size!.width).toBeLessThanOrEqual(width);
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
      await expect(dialog).toBeVisible();
      // Home + seven sections, then email and phone.
      await expect(
        dialog.getByRole("navigation").getByRole("link"),
      ).toHaveCount(8);
      await expect(
        dialog.getByRole("link", { name: "Home", exact: false }).first(),
      ).toHaveAttribute("href", "/");
      expect(
        await dialog.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.keyboard.press("Shift+Tab");
      await expect(dialog.getByRole("link").last()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("button", { name: "Close menu" }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    } else {
      await expect(
        page.getByRole("navigation", { name: "Primary", exact: true }),
      ).toBeVisible();
      await expect(page.locator(".tt-nav a")).toHaveCount(7);
      await expect(page.locator(".tt-nav a").first()).toHaveText("Home");
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).not.toBeVisible();
    }
    if ([320, 768, 1440].includes(width))
      await page.screenshot({
        path: `docs/screenshots/header-refined-${width}.png`,
        clip: { x: 0, y: 0, width, height: 200 },
      });
  });
}
for (const width of [375, 1440]) {
  test(`all shared navigation links and active states at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const route of routes) {
      if (width === 375)
        await page.getByRole("button", { name: "Open menu" }).click();
      // On desktop, Contact is the header's Enquire action.
      const nav =
        width === 375
          ? page.getByRole("navigation", { name: "Mobile", exact: true })
          : route === "contact"
            ? page.locator(".tt-header")
            : page.getByRole("navigation", { name: "Primary", exact: true });
      await nav.locator(`a[href="/${route}/"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${route}/$`));
      await expect(page.getByRole("dialog")).not.toBeVisible();
      if (width === 375)
        await page.getByRole("button", { name: "Open menu" }).click();
      await expect(nav.locator(`a[href="/${route}/"]`)).toHaveAttribute(
        "aria-current",
        "page",
      );
      if (width === 375) await page.keyboard.press("Escape");
      await expect(page.locator(".tt-header__enquire")).toHaveAttribute(
        "href",
        "/contact/",
      );
    }
  });
}
