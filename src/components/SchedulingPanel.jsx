import Field from "./Field";

export default function SchedulingPanel({ protocol, schedule }) {
  return (
    <div className="h-[calc(100dvh-20rem)] min-h-[320px] overflow-y-auto p-4">
      <div className="space-y-4">
        <div className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-700">
          <strong>Protocolo:</strong> {protocol || "—"}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data" value={schedule.data} />
          <Field label="Hora" value={schedule.hora} />
          <Field label="Canal" value={schedule.canal} />
          <Field label="Responsável" value={schedule.responsavel} />
        </div>

        <button className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
          Realizar Agendamento
        </button>
      </div>
    </div>
  );
}
