import { type ElementType, type ReactNode } from "react";
import { ArrowIcon } from "./icons";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "start" | "center";
}) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </header>
  );
}

export function TextLink({
  children,
  href,
  inverse = false,
}: {
  children: ReactNode;
  href: string;
  inverse?: boolean;
}) {
  return (
    <a
      className={`text-link ${inverse ? "text-link--inverse" : ""}`}
      href={href}
    >
      <span>{children}</span>
      <ArrowIcon className="text-link-icon" />
    </a>
  );
}

export function ButtonLink({
  children,
  href,
  tone = "primary",
}: {
  children: ReactNode;
  href: string;
  tone?: "primary" | "light" | "outline";
}) {
  return (
    <a className={`button button--${tone}`} href={href}>
      {children}
    </a>
  );
}

export function DecorativeStitch({
  as: Component = "div",
}: {
  as?: ElementType;
}) {
  return (
    <Component aria-hidden="true" className="decorative-stitch">
      <span />
      <span />
      <span />
      <span />
      <span />
    </Component>
  );
}
