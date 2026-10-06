import { adminConfigured } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default function Login() {
  return (
    <div style={{ maxWidth: 420, margin: "3rem auto" }}>
      <h1 style={{ fontSize: "var(--step-4)" }}>Shop admin</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="form-error">Admin is switched off. Set the ADMIN_PASSWORD environment variable in Vercel, then redeploy.</p>
      )}
    </div>
  );
}
