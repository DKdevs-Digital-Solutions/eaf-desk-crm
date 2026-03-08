import Field from "./Field";

export default function CustomerPanel({ customer }) {
  return (
    <div className="h-[calc(100dvh-20rem)] min-h-[320px] overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nome" value={customer.nome} />
        <Field label="CPF" value={customer.cpf} />
        <Field label="Telefone" value={customer.telefone} />
        <Field label="E-mail" value={customer.email} />
        <Field label="Produto" value={customer.produto} />
        <Field label="Status" value={customer.status} />
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
        Dados carregados pela API do CRM.
      </div>
    </div>
  );
}
