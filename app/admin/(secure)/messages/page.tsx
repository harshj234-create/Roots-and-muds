import { listMessages } from "@/lib/db";

export default async function Messages() {
  const msgs = await listMessages();
  return (
    <>
      <h1 style={{ fontSize: "var(--step-4)" }}>Messages</h1>
      {msgs.length === 0 && <p className="muted">No messages yet. Messages from the contact form appear here.</p>}
      {msgs.map((m) => (
        <article key={m.id} className="order-card">
          <header>
            <strong>{m.name}</strong>
            <span className="small muted">{new Date(m.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })}</span>
          </header>
          <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
          <p className="small" style={{ margin: 0 }}>
            {m.phone && <a href={`tel:${m.phone}`}>{m.phone}</a>} {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
          </p>
        </article>
      ))}
    </>
  );
}
