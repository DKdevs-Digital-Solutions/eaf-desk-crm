import { Paperclip, Upload } from "lucide-react";

export default function AttachmentPanel({ attachments, onUpload, uploading }) {
  return (
    <div className="flex h-[calc(100dvh-20rem)] min-h-[320px] flex-col justify-between p-4">
      <div className="overflow-y-auto rounded-xl border border-dashed border-slate-300 bg-white p-4">
        {attachments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600">
            Nenhum arquivo anexado.
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <Paperclip className="h-4 w-4" />
                  <span>{item.nome}</span>
                </div>
                {item.url && item.url !== "#" ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-700 hover:underline"
                  >
                    abrir
                  </a>
                ) : (
                  <span className="text-slate-400">sem link</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Enviando..." : "Anexar"}
        <input
          type="file"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
