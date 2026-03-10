import { Paperclip, UploadCloud, ExternalLink } from "lucide-react";

export default function AttachmentPanel({ attachments, onUpload, uploading }) {
  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div
        className="flex-1 overflow-y-auto rounded-xl"
        style={{ border: "1px solid var(--bp-border)", background: "var(--bp-white)" }}
      >
        {attachments.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center gap-2 py-12"
            style={{ color: "var(--bp-gray)" }}
          >
            <Paperclip style={{ width: 26, height: 26, opacity: 0.3 }} />
            <span className="text-xs font-semibold">Nenhum arquivo anexado.</span>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--bp-border)" }}>
            {attachments.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5">
                <Paperclip style={{ width: 13, height: 13, color: "var(--bp-blue)", flexShrink: 0 }} />
                <span className="flex-1 text-xs font-semibold truncate" style={{ color: "var(--bp-city)" }}>
                  {item.nome}
                </span>
                {item.url && item.url !== "#"
                  ? <a href={item.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold hover:underline flex-shrink-0"
                      style={{ color: "var(--bp-blue)" }}>
                      abrir <ExternalLink style={{ width: 10, height: 10 }} />
                    </a>
                  : <span className="text-xs" style={{ color: "var(--bp-gray)" }}>sem link</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>

      <label
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
        style={{ background: uploading ? "var(--bp-gray)" : "var(--bp-blue)" }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = "var(--bp-blue-hov)"; }}
        onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = uploading ? "var(--bp-gray)" : "var(--bp-blue)"; }}
      >
        <UploadCloud style={{ width: 16, height: 16 }} />
        {uploading ? "Enviando..." : "Anexar arquivo"}
        <input type="file" className="hidden" onChange={e => onUpload(e.target.files?.[0])} disabled={uploading} />
      </label>
    </div>
  );
}
