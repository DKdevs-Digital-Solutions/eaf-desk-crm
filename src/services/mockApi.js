const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let attachmentsDb = [
  { id: "1", nome: "documento.pdf", url: "#" },
  { id: "2", nome: "contrato.jpg", url: "#" }
];

export async function getProtocol() {
  await wait();
  return {
    protocol: "2024171953",
    crmLabel: "Integração lateral do CRM"
  };
}

export async function getCustomer() {
  await wait();
  return {
    nome: "Maria da Silva",
    cpf: "000.000.000-00",
    telefone: "(11) 99999-9999",
    email: "maria@email.com",
    produto: "Plano Premium",
    status: "Aguardando validação"
  };
}

export async function getSchedule() {
  await wait();
  return {
    data: "08/03/2026",
    hora: "14:00",
    canal: "WhatsApp",
    responsavel: "Operador 2024"
  };
}

export async function getAttachments() {
  await wait();
  return attachmentsDb;
}

export async function uploadAttachment(file) {
  await wait();
  const item = {
    id: String(Date.now()),
    nome: file?.name || "arquivo.txt",
    url: "#"
  };
  attachmentsDb = [item, ...attachmentsDb];
  return item;
}
