import Field from "./Field";

export default function CustomerPanel({ customer }) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><Field label="Nome"     value={customer.nome} /></div>
        <Field label="CPF"      value={customer.cpf} />
        <Field label="Telefone" value={customer.telefone} />
        <div className="col-span-2"><Field label="E-mail"  value={customer.email} /></div>
        <Field label="Produto"  value={customer.produto} />
        <Field label="Status"   value={customer.status} />
      </div>
      <p
        className="rounded-xl px-3 py-2.5 text-xs font-semibold"
        style={{ background: "var(--bp-blue-bg)", border: "1px solid var(--bp-blue-border)", color: "var(--bp-city)" }}
      >
        Dados carregados via API do CRM.
      </p>
    </div>
  );
}
