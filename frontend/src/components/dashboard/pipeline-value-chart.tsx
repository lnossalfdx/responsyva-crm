import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/shared/card";
import { pipelineValueSeries } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";

export function PipelineValueChart() {
  return (
    <Card className="h-[360px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Pipeline value</h3>
        <p className="text-sm text-zinc-400">Valor potencial por estágio ativo</p>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={pipelineValueSeries}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="stage" tick={{ fill: "#9f9fa9", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(15,15,20,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
            }}
            formatter={(value) => formatCurrency(Number(value ?? 0))}
          />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[14, 14, 0, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.55} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
