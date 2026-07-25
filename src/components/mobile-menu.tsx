"use client";

import { useEffect, useRef, useState } from "react";
import { navigation, verifiedBusiness } from "@/lib/content";
import { BrandLockup } from "./brand-lockup";
import { CloseIcon, MenuIcon } from "./icons";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerButton.current?.focus();
      }
    };

    document.body.classList.add("menu-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerButton}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="icon-button mobile-menu-trigger"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="sr-only">Open menu</span>
        <MenuIcon className="icon" />
      </button>
      {open ? (
        <div className="mobile-menu-shell" role="presentation">
          <button
            aria-label="Close menu"
            className="mobile-menu-backdrop"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div
            aria-label="Mobile navigation"
            aria-modal="true"
            className="mobile-menu"
            id="mobile-navigation"
            role="dialog"
          >
            <div className="mobile-menu-top">
              <BrandLockup className="mobile-menu-brand" />
              <button
                ref={closeButton}
                aria-label="Close menu"
                className="icon-button"
                onClick={() => {
                  setOpen(false);
                  triggerButton.current?.focus();
                }}
                type="button"
              >
                <CloseIcon className="icon" />
              </button>
            </div>
            <nav aria-label="Mobile">
              <ul className="mobile-menu-links">
                {navigation.map((item, index) => (
                  <li key={item.label}>
                    <a href={item.href} onClick={() => setOpen(false)}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mobile-menu-footer">
              <p>{verifiedBusiness.descriptor}</p>
              <a href={`mailto:${verifiedBusiness.email}`}>
                {verifiedBusiness.email}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
