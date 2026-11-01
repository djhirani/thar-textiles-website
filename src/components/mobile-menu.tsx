"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { verifiedBusiness } from "@/lib/content";
import { isCurrentRoute, primaryNavigation } from "@/lib/nav";
import { BrandLockup } from "./brand-lockup";
import { CloseIcon, MenuIcon } from "./icons";

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(true);
  const restoreScroll = useRef(true);

  function closeMenu(followingLink = false) {
    returnFocus.current = !followingLink;
    restoreScroll.current = !followingLink;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const scrollPosition = window.scrollY;
    const trigger = triggerButton.current;
    const previousBodyStyles = {
      left: document.body.style.left,
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      right: document.body.style.right,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
      if (event.key === "Tab") {
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.classList.add("menu-open");
    document.body.style.left = "0";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.right = "0";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.left = previousBodyStyles.left;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      window.removeEventListener("keydown", onKeyDown);
      const previousScrollBehavior =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      if (restoreScroll.current) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
            document.documentElement.style.scrollBehavior =
              previousScrollBehavior;
          });
        });
      } else {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      }
      if (returnFocus.current) trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerButton}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="tt-menu-trigger"
        onClick={() => {
          returnFocus.current = true;
          restoreScroll.current = true;
          setOpen(true);
        }}
        type="button"
      >
        <MenuIcon className="tt-icon" />
        <span>Menu</span>
      </button>
      {open ? (
        <div className="tt-menu" role="presentation">
          <button
            aria-label="Close menu"
            className="tt-menu__backdrop"
            onClick={() => closeMenu()}
            type="button"
          />
          <div
            ref={menuRef}
            aria-label="Mobile navigation"
            aria-modal="true"
            className="tt-menu__sheet"
            id="mobile-navigation"
            role="dialog"
          >
            <div className="tt-menu__top">
              <BrandLockup className="tt-brand__lockup" />
              <button
                ref={closeButton}
                aria-label="Close menu"
                className="tt-menu__close"
                onClick={() => closeMenu()}
                type="button"
              >
                <CloseIcon className="tt-icon" />
              </button>
            </div>
            <nav aria-label="Mobile">
              <ul className="tt-menu__links">
                {primaryNavigation.map((item, index) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={
                        isCurrentRoute(pathname, item.href) ? "page" : undefined
                      }
                      onClick={() => closeMenu(true)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="tt-menu__footer">
              <p>{verifiedBusiness.descriptor}</p>
              <a href={`mailto:${verifiedBusiness.email}`}>
                {verifiedBusiness.email}
              </a>
              <a href={`tel:+${verifiedBusiness.phoneHref}`}>
                {verifiedBusiness.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
