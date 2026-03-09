import { Card } from "@/components/shared/card";
import { conversionSeries } from "@/data/mock-data";

const stageColors = ["bg-emerald-400", "bg-cyan-400", "bg-violet-500", "bg-fuchsia-500", "bg-amber-400"];

export function FunnelChart() {
  const baseValue = conversionSeries[0]?.value ?? 1;

  return (
    <Card className="h-[360px] overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Funil de vendas</h3>
        <p className="text-sm text-zinc-400">Conversão por etapa comercial</p>
      </div>

      <div className="space-y-3">
        {conversionSeries.map((stage, index) => {
          const percentage = Math.max(6, Math.round((stage.value / baseValue) * 100));

          return (
            <div key={stage.name} className="rounded-[20px] border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`size-2.5 rounded-full ${stageColors[index]}`} />
                  <div>
                    <p className="text-[13px] font-medium leading-none text-white">{stage.name}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">{stage.value} oportunidades</p>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-zinc-400">{percentage}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full ${stageColors[index]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
