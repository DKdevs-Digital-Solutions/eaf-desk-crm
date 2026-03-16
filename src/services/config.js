export const appConfig = {
  deskUrl: import.meta.env.VITE_DESK_URL || "https://desk.blip.ai",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  customerEndpoint: import.meta.env.VITE_CUSTOMER_ENDPOINT || "/customer",
  scheduleEndpoint: import.meta.env.VITE_SCHEDULE_ENDPOINT || "/schedule",
  attachmentsEndpoint: import.meta.env.VITE_ATTACHMENTS_ENDPOINT || "/attachments",
  uploadEndpoint: import.meta.env.VITE_UPLOAD_ENDPOINT || "/attachments/upload",
  protocolEndpoint: import.meta.env.VITE_PROTOCOL_ENDPOINT || "/protocol",
  operatorEndpoint: import.meta.env.VITE_OPERATOR_ENDPOINT || "/operator",
  useMock: String(import.meta.env.VITE_USE_MOCK || "true") === "true",
  validator: {
    baseUrl:
      "https://sigaantenado.datasintese.com/crm_eaf/validacao_beneficiario.php",
    params: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjAyNCIsImlhdCI6MTcwMTg5MzIzM30.A-y9Zr4VpWfhQAEwmaKo4u6Lbu7-Sq5H9X_hRdAdJLY",
      id_crm: "2024171953",
      grupo: "9",
    },
  },
};

export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export function buildValidatorUrl({ cpf, emailOperador }) {
  const cleanCpf = String(cpf || "").replace(/\D/g, "");
  if (!cleanCpf) return "";

  return buildUrl(appConfig.validator.baseUrl, {
    cpf: cleanCpf,
    email_operador: emailOperador || "",
    token: appConfig.validator.params.token,
    id_crm: appConfig.validator.params.id_crm,
    grupo: appConfig.validator.params.grupo,
  });
}
