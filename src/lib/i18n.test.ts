import { describe, expect, it } from "vitest";
import { directionFor, publishedLocales } from "./i18n";

describe("locale publication gate", () => {
  it("reserves RTL for Urdu and Sindhi without publishing unfinished languages", () => {
    expect(directionFor("en")).toBe("ltr");
    expect(directionFor("ur")).toBe("rtl");
    expect(directionFor("sd")).toBe("rtl");
    expect(publishedLocales).toEqual(["en"]);
  });
});
