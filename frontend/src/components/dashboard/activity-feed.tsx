import { Activity, Bot, FileSignature, PiggyBank, Sparkles } from "lucide-react";
import { activities } from "@/data/mock-data";
import { Card } from "@/components/shared/card";

const iconMap = {
  lead: Activity,
  pipeline: Sparkles,
  proposal: FileSignature,
  contract: FileSignature,
  project: Bot,
  finance: PiggyBank,
};

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Timeline de atividades</h3>
          <p className="text-sm text-zinc-400">Eventos críticos do CRM nas últimas 24h</p>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div key={activity.id} className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                <Icon className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">{activity.title}</p>
                <p className="text-sm text-zinc-400">{activity.description}</p>
                <p className="text-xs text-zinc-500">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
