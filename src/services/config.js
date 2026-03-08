export const appConfig = {
  deskUrl: import.meta.env.VITE_DESK_URL || "https://macro.desk.blip.ai",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  customerEndpoint: import.meta.env.VITE_CUSTOMER_ENDPOINT || "/customer",
  scheduleEndpoint: import.meta.env.VITE_SCHEDULE_ENDPOINT || "/schedule",
  attachmentsEndpoint: import.meta.env.VITE_ATTACHMENTS_ENDPOINT || "/attachments",
  uploadEndpoint: import.meta.env.VITE_UPLOAD_ENDPOINT || "/attachments/upload",
  protocolEndpoint: import.meta.env.VITE_PROTOCOL_ENDPOINT || "/protocol",
  useMock: String(import.meta.env.VITE_USE_MOCK || "true") === "true",
  validator: {
    baseUrl:
      "https://sigaantenado.datasintese.com/crm_eaf/validacao_beneficiario_atualiza_tentativas.php",
    params: {
      cpf: "00undefined",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjAyNCIsImlhdCI6MTcwMTg5MzIzM30.A-y9Zr4VpWfhQAEwmaKo4u6Lbu7-Sq5H9X_hRdAdJLY",
      email_operador: "daniel.nascimento@dkdevs.com.br",
      id_crm: "2024171953",
      grupo: "10"
    }
  }
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
