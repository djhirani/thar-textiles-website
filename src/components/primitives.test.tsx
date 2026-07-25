import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonLink, SectionHeading } from "./primitives";

describe("design primitives", () => {
  it("renders a semantic section heading", () => {
    render(
      <SectionHeading
        copy="A concise supporting statement."
        eyebrow="Journal"
        title="Ways of making"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Ways of making", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Journal")).toBeInTheDocument();
  });

  it("renders a navigable button link", () => {
    render(<ButtonLink href="#shop">Explore</ButtonLink>);
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "#shop",
    );
  });
});
