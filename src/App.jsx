import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Contact,
  Paperclip,
  CalendarClock,
  Copy,
  ExternalLink,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CustomerPanel from "./components/CustomerPanel";
import AttachmentPanel from "./components/AttachmentPanel";
import SchedulingPanel from "./components/SchedulingPanel";
import ValidatorPanel from "./components/ValidatorPanel";
import { appConfig, buildUrl } from "./services/config";
import { useAppData } from "./hooks/useAppData";

const NAV_TABS = [
  { id: "validador", label: "Validador", Icon: ShieldCheck },
  { id: "cliente", label: "Dados do cliente", Icon: Contact },
  { id: "anexo", label: "Anexos", Icon: Paperclip },
  { id: "agendamento", label: "Agendamento", Icon: CalendarClock },
];

const CARD_SELECTOR = [
  "article.chat-list-item",
  "article.ticket-list-item",
  "article[id$='-chat-list-item']",
  "bds-card",
  "[data-ticket-id]",
  "[data-conversation-id]",
  "[data-testid*='ticket' i]",
].join(",");

function extractTicketIdFromCard(cardRoot) {
  if (!cardRoot) return null;

  try {
    const idAttr = cardRoot.getAttribute?.("id") || "";
    const match = idAttr.match(
      /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-chat-list-item$/i
    );
    if (match?.[1]) return match[1];
  } catch {}

  try {
    const aria = cardRoot.getAttribute?.("aria-label") || "";
    const match = aria.match(
      /-\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i
    );
    if (match?.[1]) return match[1];
  } catch {}

  const attrs = [
    "data-ticket-id",
    "data-ticketid",
    "data-id",
    "ticket-id",
    "ticketid",
    "data-conversation-id",
    "data-conversationid",
  ];

  for (const attr of attrs) {
    const value = cardRoot.getAttribute?.(attr);
    if (value && String(value).trim()) return String(value).trim();
  }

  for (const attr of attrs) {
    const el = cardRoot.querySelector?.(`[${attr}]`);
    const value = el?.getAttribute?.(attr);
    if (value && String(value).trim()) return String(value).trim();
  }

  const links = cardRoot.querySelectorAll?.("a[href]") || [];
  for (const link of links) {
    const href = link.getAttribute("href") || "";
    const byPath = href.match(/\/tickets\/(\w[\w-]*)/i);
    if (byPath?.[1]) return byPath[1];

    const byQuery = href.match(/ticketId=([\w-]+)/i);
    if (byQuery?.[1]) return byQuery[1];
  }

  const text = (cardRoot.textContent || "").trim();
  const byText = text.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i
  );
  if (byText?.[0]) return byText[0];

  return null;
}

function getTicketDisplayFromCard(cardRoot, ticketId) {
  try {
    const info = cardRoot?.querySelector?.("section.ticket-info, .ticket-info");
    const typo = info?.querySelector?.(
      "span.flex.truncate bds-typo, span.flex.truncate .bds-typo, span.flex.truncate"
    );
    const text = (typo?.textContent || "").trim();
    if (text) return text;
  } catch {}

  try {
    const heading = cardRoot?.querySelector?.(
      "[title], .truncate, .line-clamp-1, .line-clamp-2"
    );
    const text = (heading?.textContent || "").trim();
    if (text) return text;
  } catch {}

  if (ticketId) return `${String(ticketId).slice(0, 8)}…`;
  return "(não identificado)";
}

function findCardFromEventTarget(target) {
  if (!target || !(target instanceof Element)) return null;
  return target.closest(CARD_SELECTOR);
}

function isClickInsideInjectedCrm(target) {
  return !!target?.closest?.("[data-dk-crm-root='true']");
}

function ProtocolBar({ protocol, crmLabel, onCopy, selectedTicket }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
      style={{
        background: "var(--bp-blue-bg)",
        borderBottom: "1px solid var(--bp-blue-border)",
      }}
    >
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "var(--bp-gray)" }}
        >
          Protocolo
        </span>

        {crmLabel ? (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold hover:underline"
            style={{ color: "var(--bp-blue)" }}
          >
            <span className="truncate">{crmLabel}</span>
            <ExternalLink style={{ width: 10, height: 10, flexShrink: 0 }} />
          </a>
        ) : null}

        {selectedTicket?.title ? (
          <span
            className="mt-1 truncate text-[10px] font-semibold"
            style={{ color: "var(--bp-gray)" }}
            title={selectedTicket.title}
          >
            {selectedTicket.title}
          </span>
        ) : null}
      </div>

      <button
        onClick={onCopy}
        title="Copiar protocolo"
        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all"
        style={{
          background: "var(--bp-white)",
          border: "1px solid var(--bp-blue-border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--bp-blue)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--bp-blue-border)";
        }}
      >
        <span
          className="text-sm font-extrabold"
          style={{ color: "var(--bp-blue)" }}
        >
          {protocol || "···"}
        </span>
        <Copy
          className="opacity-0 transition-opacity group-hover:opacity-100"
          style={{ width: 12, height: 12, color: "var(--bp-gray)" }}
        />
      </button>
    </div>
  );
}

function InjectedSidebarShell({
  selectedTicket,
  activeTab,
  sidebarOpen,
  onToggleSidebar,
  onChangeTab,
  onResetSelection,
}) {
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
    upload,
  } = useAppData();

  const validatorSrc = useMemo(
    () => buildUrl(appConfig.validator.baseUrl, appConfig.validator.params),
    []
  );

  const copyProtocol = async () => {
    if (!protocol) return;
    try {
      await navigator.clipboard.writeText(protocol);
    } catch {}
  };

  const activeTabMeta = NAV_TABS.find((tab) => tab.id === activeTab);

  const handleTabClick = (id) => {
    if (activeTab === id && sidebarOpen) {
      onToggleSidebar(false);
      return;
    }

    onChangeTab(id);
    onToggleSidebar(true);
  };

  return (
    <div
      data-dk-crm-root="true"
      className="pointer-events-none fixed right-0 top-0 z-[2147483646] flex h-dvh"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <div
        className="pointer-events-auto flex-shrink-0 overflow-hidden transition-all duration-250 ease-in-out"
        style={{
          width: sidebarOpen ? "var(--panel-w)" : "0px",
          borderLeft: sidebarOpen ? "1px solid var(--bp-border)" : "none",
          background: "var(--bp-white)",
          boxShadow: sidebarOpen ? "0 0 18px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {sidebarOpen && activeTabMeta && (
          <div
            key={activeTab}
            className="panel-animate flex h-dvh flex-col overflow-hidden"
            style={{ width: "var(--panel-w)", background: "var(--bp-white)" }}
          >
            <div
              className="flex flex-shrink-0 items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: "1px solid var(--bp-border)" }}
            >
              <activeTabMeta.Icon
                style={{
                  width: 16,
                  height: 16,
                  color: "var(--bp-blue)",
                  flexShrink: 0,
                }}
              />
              <span
                className="flex-1 text-sm font-bold"
                style={{ color: "var(--bp-onix)" }}
              >
                {activeTabMeta.label}
              </span>
            </div>

            <ProtocolBar
              protocol={protocol}
              crmLabel={crmLabel}
              onCopy={copyProtocol}
              selectedTicket={selectedTicket}
            />

            {error && (
              <div
                className="mx-3 mt-2 flex-shrink-0 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: "#fff5f4",
                  border: "1px solid #fcc",
                  color: "var(--bp-warning)",
                }}
              >
                {error}
              </div>
            )}

            <div
              className="flex-1 overflow-hidden"
              style={{ background: "var(--bp-surface)" }}
            >
              {activeTab === "validador" && (
                <ValidatorPanel src={validatorSrc} title="Validador" />
              )}
              {activeTab === "cliente" && <CustomerPanel customer={customer} />}
              {activeTab === "anexo" && (
                <AttachmentPanel
                  attachments={attachments}
                  onUpload={upload}
                  uploading={uploading}
                />
              )}
              {activeTab === "agendamento" && (
                <SchedulingPanel protocol={protocol} schedule={schedule} />
              )}
            </div>
          </div>
        )}
      </div>

      <nav
        className="pointer-events-auto relative z-20 flex flex-shrink-0 flex-col items-center gap-1 py-2"
        style={{
          width: "var(--nav-w)",
          background: "var(--bp-white)",
          borderLeft: "1px solid var(--bp-border)",
          boxShadow: "0 0 18px rgba(0,0,0,0.08)",
        }}
      >
        <button
          data-tooltip="Recarregar"
          onClick={reload}
          className="mb-1 mt-1 flex h-9 w-9 items-center justify-center rounded-xl transition-all"
          style={{ color: "var(--bp-gray)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bp-surface)";
            e.currentTarget.style.color = "var(--bp-blue)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--bp-gray)";
          }}
        >
          <RefreshCcw
            style={{ width: 15, height: 15 }}
            className={loading ? "animate-spin" : ""}
          />
        </button>

        <div
          style={{
            width: 28,
            height: 1,
            background: "var(--bp-border)",
            marginBottom: 4,
          }}
        />

        {NAV_TABS.map(({ id, label, Icon }) => {
          const isActive = sidebarOpen && activeTab === id;

          return (
            <button
              key={id}
              data-tooltip={label}
              onClick={() => handleTabClick(id)}
              className="relative flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 40,
                height: 40,
                background: isActive ? "var(--bp-blue-bg)" : "transparent",
                color: isActive ? "var(--bp-blue)" : "var(--bp-gray)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bp-surface)";
                  e.currentTarget.style.color = "var(--bp-blue)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--bp-gray)";
                }
              }}
            >
              {isActive && (
                <span
                  className="absolute rounded-full"
                  style={{
                    left: -1,
                    top: "25%",
                    bottom: "25%",
                    width: 3,
                    background: "var(--bp-blue)",
                    borderRadius: "0 3px 3px 0",
                  }}
                />
              )}
              <Icon style={{ width: 18, height: 18 }} />
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          data-tooltip={sidebarOpen ? "Recolher" : "Expandir"}
          onClick={() => onToggleSidebar(!sidebarOpen)}
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl transition-all"
          style={{ color: "var(--bp-gray)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bp-surface)";
            e.currentTarget.style.color = "var(--bp-blue)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--bp-gray)";
          }}
        >
          {sidebarOpen ? (
            <ChevronRight style={{ width: 16, height: 16 }} />
          ) : (
            <ChevronLeft style={{ width: 16, height: 16 }} />
          )}
        </button>

        <button
          data-tooltip="Limpar seleção"
          onClick={onResetSelection}
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold transition-all"
          style={{ color: "var(--bp-gray)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bp-surface)";
            e.currentTarget.style.color = "var(--bp-blue)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--bp-gray)";
          }}
        >
          ×
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cliente");
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target;

      if (isClickInsideInjectedCrm(target)) return;

      const card = findCardFromEventTarget(target);
      if (!card) return;

      const ticketId = extractTicketIdFromCard(card);
      if (!ticketId) return;

      const title = getTicketDisplayFromCard(card, ticketId);

      setSelectedTicket((current) => {
        const sameTicket = current?.id === ticketId;
        return {
          id: ticketId,
          title,
          clickedAt: Date.now(),
          nonce: sameTicket ? (current?.nonce || 0) + 1 : 1,
        };
      });

      setMountKey((value) => value + 1);
      setActiveTab("cliente");
      setSidebarOpen(true);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  if (!selectedTicket) return null;

  return (
    <InjectedSidebarShell
      key={`${selectedTicket.id}-${mountKey}`}
      selectedTicket={selectedTicket}
      activeTab={activeTab}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={setSidebarOpen}
      onChangeTab={setActiveTab}
      onResetSelection={() => {
        setSelectedTicket(null);
        setSidebarOpen(false);
        setActiveTab("cliente");
      }}
    />
  );
}
