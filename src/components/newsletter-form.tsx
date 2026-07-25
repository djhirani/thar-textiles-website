"use client";

import { type FormEvent, useState } from "react";
import { verifiedBusiness } from "@/lib/content";

export function NewsletterForm() {
  const [message, setMessage] = useState(
    "Your email app will open so you can request collection updates directly.",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const subject = encodeURIComponent("Join Letters from Thar");
    const body = encodeURIComponent(
      `Please add ${email} to the Letters from Thar update list.`,
    );

    setMessage("Opening your email app to complete your request.");
    window.location.href = `mailto:${verifiedBusiness.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label htmlFor="email">Email address</label>
      <div>
        <input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="Email address"
          required
          type="email"
        />
        <button type="submit">Join by email</button>
      </div>
      <p aria-live="polite">{message}</p>
    </form>
  );
}
