"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    if (res?.ok) setState("sent");
    else {
      setError((await res?.json().catch(() => null))?.error ?? "Your message couldn't be sent. Check your connection and try again, or WhatsApp us.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="applied" role="status">
        <strong>Message sent</strong>
        Thank you. We'll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {state === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="two">
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" name="name" required autoComplete="name" maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="c-phone">Mobile number</label>
          <input id="c-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="05X XXX XXXX" maxLength={20} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-email">
          Email <span className="hint">(optional)</span>
        </label>
        <input id="c-email" name="email" type="email" autoComplete="email" maxLength={150} />
      </div>
      <div className="field">
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" name="message" required maxLength={2000} />
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn btn-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
