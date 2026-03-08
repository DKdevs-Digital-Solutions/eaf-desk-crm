# Blip Protocolo com APIs

Projeto React + Vite + Tailwind mantendo o layout lateral igual ao modelo, mas com camada de integração por API.

## Recursos
- layout lateral igual ao modelo
- iframe principal do Blip Desk
- carregamento de protocolo via API
- carregamento de dados do cliente via API
- carregamento de agendamento via API
- listagem e upload de anexos via API
- fallback para mock quando `VITE_USE_MOCK=true`

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente

Configure o `.env` com seus endpoints reais.

## Formato esperado das APIs

### GET protocolo
Retorno:
```json
{
  "protocol": "2024171953",
  "crmLabel": "Integração lateral do CRM"
}
```

### GET customer
Retorno:
```json
{
  "nome": "Maria da Silva",
  "cpf": "000.000.000-00",
  "telefone": "(11) 99999-9999",
  "email": "maria@email.com",
  "produto": "Plano Premium",
  "status": "Aguardando validação"
}
```

### GET schedule
Retorno:
```json
{
  "data": "08/03/2026",
  "hora": "14:00",
  "canal": "WhatsApp",
  "responsavel": "Operador 2024"
}
```

### GET attachments
Retorno:
```json
[
  {
    "id": "1",
    "nome": "documento.pdf",
    "url": "https://exemplo.com/documento.pdf"
  }
]
```

### POST upload
Envie `multipart/form-data` com o campo `file`.
