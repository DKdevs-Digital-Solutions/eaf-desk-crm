import { appConfig } from "./config";
import * as mockApi from "./mockApi";

async function request(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function getProtocol(identity) {
  if (appConfig.useMock) return mockApi.getProtocol();
  const suffix = identity ? `?identity=${encodeURIComponent(identity)}` : "";
  return request(`${appConfig.protocolEndpoint}${suffix}`);
}

export async function getCustomer(identity) {
  if (appConfig.useMock) return mockApi.getCustomer();
  const suffix = identity ? `?identity=${encodeURIComponent(identity)}` : "";
  return request(`${appConfig.customerEndpoint}${suffix}`);
}

export async function getSchedule(identity) {
  if (appConfig.useMock) return mockApi.getSchedule();
  const suffix = identity ? `?identity=${encodeURIComponent(identity)}` : "";
  return request(`${appConfig.scheduleEndpoint}${suffix}`);
}

export async function getAttachments(identity) {
  if (appConfig.useMock) return mockApi.getAttachments();
  const suffix = identity ? `?identity=${encodeURIComponent(identity)}` : "";
  return request(`${appConfig.attachmentsEndpoint}${suffix}`);
}

export async function getOperator() {
  if (appConfig.useMock) {
    return { email: "operador@exemplo.com.br" };
  }
  return request(appConfig.operatorEndpoint);
}

export async function uploadAttachment(file, identity) {
  if (appConfig.useMock) return mockApi.uploadAttachment(file);

  const formData = new FormData();
  formData.append("file", file);
  if (identity) {
    formData.append("identity", identity);
  }

  return request(appConfig.uploadEndpoint, {
    method: "POST",
    body: formData
  });
}
