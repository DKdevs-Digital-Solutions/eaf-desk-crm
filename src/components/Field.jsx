export default function Field({ label, value }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ border: "1px solid var(--bp-border)", background: "var(--bp-white)" }}
    >
      <p
        className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
        style={{ color: "var(--bp-gray)" }}
      >
        {label}
      </p>
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--bp-onix)" }}>
        {value || <span style={{ color: "#C0C0C0" }}>—</span>}
      </p>
    </div>
  );
}
