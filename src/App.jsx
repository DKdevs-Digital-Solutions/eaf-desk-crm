import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { appConfig, buildValidatorUrl } from "./services/config";
import { useAppData } from "./hooks/useAppData";

const NAV_TABS = [
  { id: "validador", label: "Validador", Icon: ShieldCheck },
  { id: "cliente", label: "Dados do cliente", Icon: Contact },
  { id: "anexo", label: "Anexos", Icon: Paperclip },
  { id: "agendamento", label: "Agendamento", Icon: CalendarClock },
];

/* ─── Shared protocol bar rendered at the top of every panel ─── */
function ProtocolBar({ protocol, crmLabel, onCopy }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
      style={{
        background: "var(--bp-blue-bg)",
        borderBottom: "1px solid var(--bp-blue-border)",
      }}
    >
      <div className="flex flex-col leading-tight">
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "var(--bp-gray)" }}
        >
          Protocolo
        </span>

        {crmLabel && (
          <a
            href="#"
            className="flex items-center gap-1 text-[10px] font-semibold hover:underline mt-0.5"
            style={{ color: "var(--bp-blue)" }}
          >
            {crmLabel}
            <ExternalLink style={{ width: 10, height: 10 }} />
          </a>
        )}
      </div>

      <button
        onClick={onCopy}
        title="Copiar protocolo"
        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all"
        style={{
          background: "var(--bp-white)",
          border: "1px solid var(--bp-blue-border)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--bp-blue)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bp-blue-border)")}
      >
        <span className="text-sm font-extrabold" style={{ color: "var(--bp-blue)" }}>
          {protocol || "···"}
        </span>
        <Copy
          className="transition-opacity opacity-0 group-hover:opacity-100"
          style={{ width: 12, height: 12, color: "var(--bp-gray)" }}
        />
      </button>
    </div>
  );
}

export default function App() {
  const iframeRef = useRef(null);
  const observerRef = useRef(null);
  const lastArticleIdRef = useRef(null);

  const [navVisible, setNavVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedIdentity, setSelectedIdentity] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const {
    loading,
    uploading,
    protocol,
    crmLabel,
    customer,
    schedule,
    attachments,
    operatorEmail,
    error,
    reload,
    upload,
  } = useAppData(selectedIdentity, selectedContact);

  const validatorSrc = useMemo(
    () =>
      buildValidatorUrl({
        cpf: customer?.cpf,
        emailOperador: operatorEmail || selectedContact?.emailOperador || "",
      }),
    [customer?.cpf, operatorEmail, selectedContact]
  );

  const copyProtocol = async () => {
    if (!protocol) return;
    try {
      await navigator.clipboard.writeText(protocol);
    } catch {}
  };

  const handleTabClick = (id) => {
    if (!navVisible) return;

    if (activeTab === id && sidebarOpen) {
      setSidebarOpen(false);
      return;
    }

    setActiveTab(id);
    setSidebarOpen(true);
  };

  const activeTabMeta = NAV_TABS.find((t) => t.id === activeTab);

  const handleArticleSelection = useCallback((article) => {
    if (!article) return;

    const articleId =
      article.getAttribute("id") ||
      article.getAttribute("aria-label") ||
      article.dataset.ticketId ||
      null;

    if (!articleId) return;

    lastArticleIdRef.current = articleId;

    setNavVisible(true);
    setSidebarOpen(true);
    setActiveTab((prev) => prev ?? "cliente");
  }, []);

  const injectDeskBridge = useCallback((iframe) => {
    try {
      const iframeWin = iframe?.contentWindow;
      const iframeDoc = iframe?.contentDocument || iframeWin?.document;

      if (!iframeWin || !iframeDoc) return;
      if (iframeWin.__deskBridgeInjected) return;

      iframeWin.__deskBridgeInjected = true;

      iframeWin.eval(`
        (function () {
          if (window.__deskContactBridgeLoaded) return;
          window.__deskContactBridgeLoaded = true;

          function safeParse(value) {
            try { return JSON.parse(value); } catch { return null; }
          }

          function getAgentEmail() {
            try {
              const ajs = safeParse(localStorage.getItem("ajs_user_traits") || "{}");
              if (ajs && ajs.email) return String(ajs.email).trim();
            } catch {}

            try {
              const auth = safeParse(localStorage.getItem("auth") || "{}");
              if (auth && auth.user && auth.user.email) return String(auth.user.email).trim();
            } catch {}

            try {
              const user = safeParse(localStorage.getItem("user") || "{}");
              if (user && user.email) return String(user.email).trim();
            } catch {}

            return "";
          }

          function emitContact(payload) {
            if (!payload) return;

            window.parent.postMessage(
              {
                source: "desk-contact-bridge",
                identity: payload.identity || "",
                cpf: payload.cpf || "",
                nome: payload.nome || "",
                email: payload.email || "",
                telefone: payload.telefone || "",
                emailOperador: getAgentEmail(),
              },
              "*"
            );
          }

          function normalizeContact(raw) {
            if (!raw || typeof raw !== "object") return null;

            const normalized = {
              identity:
                raw.identity ||
                raw.customerIdentity ||
                raw.contactIdentity ||
                raw.address ||
                raw.customer?.identity ||
                raw.contact?.identity ||
                "",
              cpf:
                raw.taxDocument ||
                raw.document ||
                raw.cpf ||
                raw.customer?.taxDocument ||
                raw.contact?.taxDocument ||
                "",
              nome:
                raw.name ||
                raw.fullName ||
                raw.customer?.name ||
                raw.contact?.name ||
                "",
              email:
                raw.email ||
                raw.customer?.email ||
                raw.contact?.email ||
                "",
              telefone:
                raw.phoneNumber ||
                raw.phone ||
                raw.mobilePhone ||
                raw.customer?.phoneNumber ||
                raw.contact?.phoneNumber ||
                ""
            };

            if (!normalized.identity && !normalized.cpf) return null;
            return normalized;
          }

          function extractCandidatesFromAny(data) {
            const out = [];
            if (!data) return out;

            if (Array.isArray(data)) {
              for (const item of data) out.push(item);
              return out;
            }

            if (typeof data === "object") {
              out.push(data);

              const commonKeys = [
                "resource",
                "item",
                "items",
                "result",
                "results",
                "data",
                "contact",
                "customer",
                "ticket",
                "tickets",
                "attendant",
                "attendants",
                "visitor",
                "client"
              ];

              for (const key of commonKeys) {
                if (data[key]) {
                  if (Array.isArray(data[key])) out.push(...data[key]);
                  else out.push(data[key]);
                }
              }
            }

            return out;
          }

          function tryEmitFromUnknown(data) {
            const candidates = extractCandidatesFromAny(data);

            for (const candidate of candidates) {
              const parsed = normalizeContact(candidate);
              if (parsed) {
                emitContact(parsed);
                return true;
              }
            }

            return false;
          }

          function tryFromGlobals() {
            const candidates = [
              window.currentTicket,
              window.ticket,
              window.selectedTicket,
              window.currentContact,
              window.contact,
              window.currentCustomer,
              window.customer,
              window.__NEXT_DATA__,
              window.store?.getState?.(),
              window.reduxStore?.getState?.()
            ];

            for (const item of candidates) {
              if (tryEmitFromUnknown(item)) {
                return true;
              }
            }

            return false;
          }

          function tryFromArticles() {
            const articles = Array.from(document.querySelectorAll("article"));

            for (const article of articles) {
              const datasets = [
                article.dataset,
                article.__reactProps,
                article.__reactFiber,
              ];

              for (const item of datasets) {
                if (tryEmitFromUnknown(item)) {
                  return true;
                }
              }
            }

            return false;
          }

          const originalFetch = window.fetch;
          if (typeof originalFetch === "function") {
            window.fetch = async function (...args) {
              const response = await originalFetch.apply(this, args);

              try {
                const requestUrl = String(args?.[0]?.url || args?.[0] || "");

                if (
                  requestUrl.includes("ticket") ||
                  requestUrl.includes("tickets") ||
                  requestUrl.includes("contact") ||
                  requestUrl.includes("contacts") ||
                  requestUrl.includes("customer") ||
                  requestUrl.includes("customers") ||
                  requestUrl.includes("attendant") ||
                  requestUrl.includes("chat")
                ) {
                  response.clone().text().then((text) => {
                    try {
                      const data = JSON.parse(text);
                      tryEmitFromUnknown(data);
                    } catch {}
                  }).catch(() => {});
                }
              } catch {}

              return response;
            };
          }

          const OriginalXHR = window.XMLHttpRequest;
          if (OriginalXHR && !window.__deskBridgeXHRWrapped) {
            window.__deskBridgeXHRWrapped = true;

            const originalOpen = OriginalXHR.prototype.open;
            const originalSend = OriginalXHR.prototype.send;

            OriginalXHR.prototype.open = function (method, url) {
              this.__bridgeUrl = url;
              return originalOpen.apply(this, arguments);
            };

            OriginalXHR.prototype.send = function () {
              this.addEventListener("load", function () {
                try {
                  const requestUrl = String(this.__bridgeUrl || "");
                  if (
                    requestUrl.includes("ticket") ||
                    requestUrl.includes("tickets") ||
                    requestUrl.includes("contact") ||
                    requestUrl.includes("contacts") ||
                    requestUrl.includes("customer") ||
                    requestUrl.includes("customers") ||
                    requestUrl.includes("attendant") ||
                    requestUrl.includes("chat")
                  ) {
                    const text = this.responseText;
                    if (text) {
                      try {
                        const data = JSON.parse(text);
                        tryEmitFromUnknown(data);
                      } catch {}
                    }
                  }
                } catch {}
              });

              return originalSend.apply(this, arguments);
            };
          }

          tryFromGlobals();
          tryFromArticles();

          const observer = new MutationObserver(() => {
            tryFromGlobals();
            tryFromArticles();
          });

          observer.observe(document.documentElement || document.body, {
            subtree: true,
            childList: true
          });
        })();
      `);
    } catch (err) {
      console.error("Falha ao injetar bridge no Desk:", err);
    }
  }, []);

  useEffect(() => {
    const handleDeskMessage = (event) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;
      if (data.source !== "desk-contact-bridge") return;

      const nextIdentity = String(data.identity || "").trim();
      const nextContact = {
        identity: nextIdentity,
        cpf: String(data.cpf || "").trim(),
        nome: String(data.nome || "").trim(),
        email: String(data.email || "").trim(),
        telefone: String(data.telefone || "").trim(),
        emailOperador: String(data.emailOperador || "").trim(),
      };

      setSelectedIdentity(nextIdentity);
      setSelectedContact(nextContact);

      setNavVisible(true);
      setSidebarOpen(true);
      setActiveTab((prev) => prev ?? "cliente");
    };

    window.addEventListener("message", handleDeskMessage);
    return () => window.removeEventListener("message", handleDeskMessage);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupFns = [];

    const attachArticleListeners = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const articles = iframeDoc.querySelectorAll("article.ticket-list-item");

      articles.forEach((article) => {
        if (article.dataset.bpNavBound === "true") return;

        article.dataset.bpNavBound = "true";

        const onClick = () => {
          handleArticleSelection(article);
        };

        article.addEventListener("click", onClick, true);

        cleanupFns.push(() => {
          article.removeEventListener("click", onClick, true);
          delete article.dataset.bpNavBound;
        });
      });
    };

    const onLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      injectDeskBridge(iframe);
      attachArticleListeners();

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new MutationObserver(() => {
        attachArticleListeners();
      });

      if (iframeDoc.body) {
        observerRef.current.observe(iframeDoc.body, {
          childList: true,
          subtree: true,
        });
      }
    };

    iframe.addEventListener("load", onLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      onLoad();
    }

    return () => {
      iframe.removeEventListener("load", onLoad);

      cleanupFns.forEach((fn) => fn());

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleArticleSelection, injectDeskBridge]);

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "var(--bp-surface)",
      }}
    >
      <div className="relative flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          id="blip-desk"
          title="Blip Desk"
          src={appConfig.deskUrl}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          allow="camera; microphone; notifications; clipboard; cookies; geolocation; midi; encrypted-media; autoplay; vr; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; payment; usb; sync-xhr; fullscreen; display-capture"
          className="h-full w-full bg-white"
        />
      </div>

      {navVisible && (
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-250 ease-in-out"
          style={{
            width: sidebarOpen ? "var(--panel-w)" : "0px",
            borderLeft: sidebarOpen ? "1px solid var(--bp-border)" : "none",
          }}
        >
          {sidebarOpen && activeTabMeta && (
            <div
              key={activeTab}
              className="panel-animate flex flex-col h-dvh overflow-hidden"
              style={{
                width: "var(--panel-w)",
                background: "var(--bp-white)",
              }}
            >
              <div
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3"
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
                  className="text-sm font-bold flex-1"
                  style={{ color: "var(--bp-onix)" }}
                >
                  {activeTabMeta.label}
                </span>
              </div>

              <ProtocolBar
                protocol={protocol}
                crmLabel={crmLabel}
                onCopy={copyProtocol}
              />

              {error && (
                <div
                  className="mx-3 mt-2 rounded-lg px-3 py-2 text-xs font-semibold flex-shrink-0"
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
      )}

      {navVisible && (
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
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all mb-1"
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
        </nav>
      )}
    </div>
  );
}
