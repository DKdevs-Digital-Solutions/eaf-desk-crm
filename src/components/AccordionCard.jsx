import { ChevronDown } from "lucide-react";
import SectionFrame from "./SectionFrame";
import ValidatorPanel from "./ValidatorPanel";
import CustomerPanel from "./CustomerPanel";
import AttachmentPanel from "./AttachmentPanel";
import SchedulingPanel from "./SchedulingPanel";

export default function AccordionCard({ item, open, onToggle, protocol, customer, schedule, attachments, onUpload, uploading }) {
  const Icon = item.icon;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bp-white)",
        border: "1px solid var(--bp-border)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition"
        style={{ background: open ? "#f0f7ff" : "transparent" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "#f8fafb"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <span className="flex items-center gap-2.5 text-sm font-bold" style={{ color: "var(--bp-onix)" }}>
          <Icon className="h-4 w-4" style={{ color: open ? "var(--bp-primary)" : "var(--bp-rooftop)" }} />
          {item.title}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{ color: "var(--bp-rooftop)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <SectionFrame>
          {item.type === "iframe"     ? <ValidatorPanel src={item.src} title={item.title} />
          : item.id === "cliente"     ? <CustomerPanel customer={customer} />
          : item.id === "anexo"       ? <AttachmentPanel attachments={attachments} onUpload={onUpload} uploading={uploading} />
          :                             <SchedulingPanel protocol={protocol} schedule={schedule} />
          }
        </SectionFrame>
      )}
    </div>
  );
}
