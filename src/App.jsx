import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserRound,
  Paperclip,
  Radio,
  X,
  Copy,
  ExternalLink,
  RefreshCcw
} from "lucide-react";
import AccordionCard from "./components/AccordionCard";
import { appConfig, buildUrl } from "./services/config";
import { useAppData } from "./hooks/useAppData";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openItems, setOpenItems] = useState(["agendamento"]);

  const {
    loading,
    uploading,
    protocol,
    crmLabel,
    customer,
    schedule,
    attachments,
    error,
    reload,
    upload
  } = useAppData();

  const validatorSrc = useMemo(
    () => buildUrl(appConfig.validator.baseUrl, appConfig.validator.params),
    []
  );

  const modules = useMemo(
    () => [
      {
        id: "validador",
        title: "Validador",
        icon: CheckCircle2,
        type: "iframe",
        src: validatorSrc
      },
      {
        id: "cliente",
        title: "Dados do cliente",
        icon: UserRound,
        type: "content"
      },
      {
        id: "anexo",
        title: "Anexo",
        icon: Paperclip,
        type: "content"
      },
      {
        id: "agendamento",
        title: "Agendamento",
        icon: Radio,
        type: "content"
      }
    ],
    [validatorSrc]
  );

  const toggleItem = (id) => {
    setOpenItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const copyProtocol = async () => {
    if (!protocol) return;
    try {
      await navigator.clipboard.writeText(protocol);
    } catch (error) {
      console.error("Falha ao copiar protocolo", error);
    }
  };

  return (
    <div className="relative flex h-dvh overflow-hidden bg-slate-100 text-slate-900">
      <div className="relative flex-1 overflow-hidden">
        <iframe
          id="blip-desk"
          title="Blip Desk"
          src={appConfig.deskUrl}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          allow="camera; microphone; notifications; clipboard; cookies; geolocation; midi; encrypted-media; autoplay; vr; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; payment; usb; sync-xhr; fullscreen; display-capture"
          className="h-full w-full bg-white"
        />

        <button
          onClick={() => setSidebarOpen((value) => !value)}
          className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:bg-white"
        >
          {sidebarOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {sidebarOpen ? "Ocultar Apps" : "Exibir Apps"}
        </button>
      </div>

      <aside
        className={`absolute right-0 top-0 z-10 flex h-dvh w-full max-w-[420px] flex-col border-l border-slate-200 bg-[#E0E0E0] transition-transform duration-300 ease-in-out md:w-[32vw] ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative mb-1 border-b border-slate-300 bg-white px-4 py-6 text-center shadow-sm">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Fechar painel"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={reload}
            className="absolute left-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Recarregar dados"
            title="Recarregar dados"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <h1 className="text-xl font-semibold">Protocolo</h1>

          <button
            onClick={copyProtocol}
            className="group mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-sky-700 transition hover:text-sky-800"
            title="Copiar protocolo"
          >
            <span>{protocol || "..."}</span>
            <Copy className="h-5 w-5 opacity-0 transition group-hover:opacity-100" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>{crmLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {error ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {modules.map((item) => (
            <AccordionCard
              key={item.id}
              item={item}
              protocol={protocol}
              customer={customer}
              schedule={schedule}
              attachments={attachments}
              onUpload={upload}
              uploading={uploading}
              open={openItems.includes(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}
