import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck, Contact, Paperclip, CalendarClock,
  Copy, ExternalLink, RefreshCcw, ChevronRight,
} from "lucide-react";
import CustomerPanel   from "./components/CustomerPanel";
import AttachmentPanel from "./components/AttachmentPanel";
import SchedulingPanel from "./components/SchedulingPanel";
import ValidatorPanel  from "./components/ValidatorPanel";
import { appConfig, buildUrl } from "./services/config";
import { useAppData }  from "./hooks/useAppData";

const NAV_TABS = [
  { id: "validador",   label: "Validador",       Icon: ShieldCheck   },
  { id: "cliente",     label: "Dados do cliente", Icon: Contact       },
  { id: "anexo",       label: "Anexos",           Icon: Paperclip     },
  { id: "agendamento", label: "Agendamento",      Icon: CalendarClock },
];

function ProtocolBar({ protocol, crmLabel, onCopy }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
      style={{ background: "var(--bp-blue-bg)", borderBottom: "1px solid var(--bp-blue-border)" }}
    >
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--bp-gray)" }}>
          Protocolo
        </span>
        {crmLabel && (
          <a href="#" className="flex items-center gap-1 text-[10px] font-semibold hover:underline mt-0.5"
            style={{ color: "var(--bp-blue)" }}>
            {crmLabel}
            <ExternalLink style={{ width: 10, height: 10 }} />
          </a>
        )}
      </div>
      <button
        onClick={onCopy}
        title="Copiar protocolo"
        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all"
        style={{ background: "var(--bp-white)", border: "1px solid var(--bp-blue-border)" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--bp-blue)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--bp-blue-border)"}
      >
        <span className="text-sm font-extrabold" style={{ color: "var(--bp-blue)" }}>
          {protocol || "···"}
        </span>
        <Copy className="transition-opacity opacity-0 group-hover:opacity-100"
          style={{ width: 12, height: 12, color: "var(--bp-gray)" }} />
      </button>
    </div>
  );
}

export default function App() {
  const [ticketOpen, setTicketOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState(null);
  const lastTicketIdRef               = useRef(null);

  const { loading, uploading, protocol, crmLabel, customer, schedule, attachments, error, reload, upload } = useAppData();

  const validatorSrc = useMemo(
    () => buildUrl(appConfig.validator.baseUrl, appConfig.validator.params), []
  );

  // Extrai o UUID do ticket da URL do iframe
  // URL do Blip Desk muda para /{uuid} ao abrir um ticket (SPA)
  const getIframeTicketId = useCallback(() => {
    try {
      const iframe = document.getElementById("blip-desk");
      const href = iframe?.contentWindow?.location?.href ?? "";
      const match = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      return match ? match[0] : null;
    } catch {
      // cross-origin — não conseguimos ler a URL diretamente
      return null;
    }
  }, []);

  useEffect(() => {
    // ── Estratégia 1: polling da URL do iframe (SPA) ──────────────────
    // O Blip Desk muda a URL ao selecionar um ticket.
    // Se o app rodar no mesmo domínio (*.desk.blip.ai), isso funciona.
    const poll = setInterval(() => {
      const id = getIframeTicketId();
      if (id && id !== lastTicketIdRef.current) {
        lastTicketIdRef.current = id;
        setTicketOpen(true);
        reload();
      }
    }, 500);

    // ── Estratégia 2: window blur ─────────────────────────────────────
    // Quando o usuário clica dentro do iframe o foco sai do window.
    // Combinamos com um pequeno delay para dar tempo da URL do SPA mudar.
    const onBlur = () => {
      if (document.activeElement?.tagName !== "IFRAME") return;
      setTimeout(() => {
        const id = getIframeTicketId();
        if (id && id !== lastTicketIdRef.current) {
          lastTicketIdRef.current = id;
          setTicketOpen(true);
          reload();
        }
      }, 300);
    };

    // ── Estratégia 3: postMessage do Blip Desk ────────────────────────
    // Caso o Desk emita eventos nativos de navegação/seleção.
    const onMessage = (event) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data || typeof data !== "object") return;
        const isTicket =
          data.action === "ticket-selected"       ||
          data.action === "conversation-selected" ||
          data.type   === "ticket-selected"       ||
          data.eventName === "ticket-selected"    ||
          !!data.ticketId || !!data.ticket        ||
          !!data.attendanceId || !!data.threadId  ||
          !!data.conversationId;
        if (isTicket) {
          setTicketOpen(true);
          reload();
        }
      } catch {}
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("message", onMessage);

    return () => {
      clearInterval(poll);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("message", onMessage);
    };
  }, [getIframeTicketId, reload]);

  const copyProtocol = async () => {
    if (!protocol) return;
    try { await navigator.clipboard.writeText(protocol); } catch {}
  };

  const handleTabClick = (id) => {
    if (activeTab === id && sidebarOpen) setSidebarOpen(false);
    else { setActiveTab(id); setSidebarOpen(true); }
  };

  const activeTabMeta = NAV_TABS.find(t => t.id === activeTab);

  return (
    <div className="flex h-dvh overflow-hidden"
      style={{ fontFamily: "'Nunito', sans-serif", background: "var(--bp-surface)" }}>

      {/* ── 1. Blip Desk iframe ── */}
      <div className="relative flex-1 overflow-hidden">
        <iframe
          id="blip-desk"
          title="Blip Desk"
          src={appConfig.deskUrl}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          allow="camera; microphone; notifications; clipboard; cookies; geolocation; midi; encrypted-media; autoplay; vr; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; payment; usb; sync-xhr; fullscreen; display-capture"
          className="h-full w-full bg-white"
        />
      </div>

      {/* ── 2. Painel de conteúdo ── */}
      <div
        className="flex-shrink-0 overflow-hidden transition-all duration-250 ease-in-out"
        style={{
          width: sidebarOpen ? "var(--panel-w)" : "0px",
          borderLeft: sidebarOpen ? "1px solid var(--bp-border)" : "none",
        }}
      >
        {sidebarOpen && activeTabMeta && (
          <div key={activeTab} className="panel-animate flex flex-col h-dvh overflow-hidden"
            style={{ width: "var(--panel-w)", background: "var(--bp-white)" }}>

            <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: "1px solid var(--bp-border)" }}>
              <activeTabMeta.Icon style={{ width: 16, height: 16, color: "var(--bp-blue)", flexShrink: 0 }} />
              <span className="text-sm font-bold flex-1" style={{ color: "var(--bp-onix)" }}>
                {activeTabMeta.label}
              </span>
            </div>

            <ProtocolBar protocol={protocol} crmLabel={crmLabel} onCopy={copyProtocol} />

            {error && (
              <div className="mx-3 mt-2 rounded-lg px-3 py-2 text-xs font-semibold flex-shrink-0"
                style={{ background: "#fff5f4", border: "1px solid #fcc", color: "var(--bp-warning)" }}>
                {error}
              </div>
            )}

            <div className="flex-1 overflow-hidden" style={{ background: "var(--bp-surface)" }}>
              {activeTab === "validador"   && <ValidatorPanel src={validatorSrc} title="Validador" />}
              {activeTab === "cliente"     && <CustomerPanel customer={customer} />}
              {activeTab === "anexo"       && <AttachmentPanel attachments={attachments} onUpload={upload} uploading={uploading} />}
              {activeTab === "agendamento" && <SchedulingPanel protocol={protocol} schedule={schedule} />}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Navbar — aparece ao primeiro ticket ── */}
      {ticketOpen && (
        <nav
          className="relative z-20 flex flex-col items-center gap-1 flex-shrink-0 py-2"
          style={{
            width: "var(--nav-w)",
            background: "var(--bp-white)",
            borderLeft: "1px solid var(--bp-border)",
          }}
        >
          <button
            data-tooltip="Recarregar"
            onClick={reload}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all mt-1 mb-1"
            style={{ color: "var(--bp-gray)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bp-surface)"; e.currentTarget.style.color = "var(--bp-blue)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--bp-gray)"; }}
          >
            <RefreshCcw style={{ width: 15, height: 15 }} className={loading ? "animate-spin" : ""} />
          </button>

          <div style={{ width: 28, height: 1, background: "var(--bp-border)", marginBottom: 4 }} />

          {NAV_TABS.map(({ id, label, Icon }) => {
            const isActive = sidebarOpen && activeTab === id;
            return (
              <button
                key={id}
                data-tooltip={label}
                onClick={() => handleTabClick(id)}
                className="relative flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: isActive ? "var(--bp-blue-bg)" : "transparent",
                  color: isActive ? "var(--bp-blue)" : "var(--bp-gray)",
                }}
                onMouseEnter={e => {
                  if (!isActive) { e.currentTarget.style.background = "var(--bp-surface)"; e.currentTarget.style.color = "var(--bp-blue)"; }
                }}
                onMouseLeave={e => {
                  if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--bp-gray)"; }
                }}
              >
                {isActive && (
                  <span className="absolute rounded-full" style={{
                    left: -1, top: "25%", bottom: "25%", width: 3,
                    background: "var(--bp-blue)", borderRadius: "0 3px 3px 0",
                  }} />
                )}
                <Icon style={{ width: 18, height: 18 }} />
              </button>
            );
          })}

          <div className="flex-1" />

          {sidebarOpen && (
            <button
              data-tooltip="Recolher"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all mb-1"
              style={{ color: "var(--bp-gray)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bp-surface)"; e.currentTarget.style.color = "var(--bp-blue)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--bp-gray)"; }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
