import { ChevronRight } from "lucide-react";
import SectionFrame from "./SectionFrame";
import ValidatorPanel from "./ValidatorPanel";
import CustomerPanel from "./CustomerPanel";
import AttachmentPanel from "./AttachmentPanel";
import SchedulingPanel from "./SchedulingPanel";

export default function AccordionCard({
  item,
  open,
  onToggle,
  protocol,
  customer,
  schedule,
  attachments,
  onUpload,
  uploading
}) {
  const Icon = item.icon;

  return (
    <div className="px-2 py-1">
      <div className="rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Icon className="h-4 w-4 text-slate-600" />
            <span>{item.title}</span>
          </h3>

          <ChevronRight
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>

        {open && (
          <SectionFrame>
            {item.type === "iframe" ? (
              <ValidatorPanel src={item.src} title={item.title} />
            ) : item.id === "cliente" ? (
              <CustomerPanel customer={customer} />
            ) : item.id === "anexo" ? (
              <AttachmentPanel
                attachments={attachments}
                onUpload={onUpload}
                uploading={uploading}
              />
            ) : (
              <SchedulingPanel protocol={protocol} schedule={schedule} />
            )}
          </SectionFrame>
        )}
      </div>
    </div>
  );
}
