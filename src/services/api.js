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

export async function getProtocol() {
  if (appConfig.useMock) return mockApi.getProtocol();
  return request(appConfig.protocolEndpoint);
}

export async function getCustomer() {
  if (appConfig.useMock) return mockApi.getCustomer();
  return request(appConfig.customerEndpoint);
}

export async function getSchedule() {
  if (appConfig.useMock) return mockApi.getSchedule();
  return request(appConfig.scheduleEndpoint);
}

export async function getAttachments() {
  if (appConfig.useMock) return mockApi.getAttachments();
  return request(appConfig.attachmentsEndpoint);
}

export async function uploadAttachment(file) {
  if (appConfig.useMock) return mockApi.uploadAttachment(file);

  const formData = new FormData();
  formData.append("file", file);

  return request(appConfig.uploadEndpoint, {
    method: "POST",
    body: formData
  });
}
