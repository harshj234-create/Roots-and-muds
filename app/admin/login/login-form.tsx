"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action}>
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="field">
        <label htmlFor="pw">Password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required autoFocus />
      </div>
      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
