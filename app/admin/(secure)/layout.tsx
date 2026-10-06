import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { usingDatabase } from "@/lib/db";
import { logout } from "../actions";
import { AdminNav } from "./nav";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <>
      <div className="admin-nav">
        <AdminNav />
        <form action={logout} style={{ marginInlineStart: "auto" }}>
          <button className="link-btn">Log out</button>
        </form>
      </div>
      {!usingDatabase && (
        <p className="form-error">
          No database connected: orders are being saved to a local test file. Connect a database before going live (see README).
        </p>
      )}
      {children}
    </>
  );
}
