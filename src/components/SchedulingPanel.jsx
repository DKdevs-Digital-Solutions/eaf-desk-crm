import Field from "./Field";

export default function SchedulingPanel({ schedule }) {
  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Data"        value={schedule.data} />
        <Field label="Hora"        value={schedule.hora} />
        <Field label="Canal"       value={schedule.canal} />
        <Field label="Responsável" value={schedule.responsavel} />
      </div>
      <div className="flex-1" />
      <button
        className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
        style={{ background: "var(--bp-blue)" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bp-blue-hov)"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--bp-blue)"}
      >
        Realizar Agendamento
      </button>
    </div>
  );
}
