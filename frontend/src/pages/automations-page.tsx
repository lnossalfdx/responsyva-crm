import { Bot, Workflow } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";

export function AutomationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Automation fabric"
        title="Automações"
        description="Camada preparada para playbooks futuros com IA, n8n, webhooks, rotinas comerciais, onboarding e orquestração operacional."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          "Lead scoring dinâmico por sinais de intenção",
          "Criação automática de cliente, projeto e financeiro ao fechar negócio",
          "Follow-up inteligente para propostas sem resposta",
        ].map((item, index) => (
          <Card key={item} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-emerald-200">
                {index % 2 === 0 ? <Bot className="size-5" /> : <Workflow className="size-5" />}
              </div>
              <Badge tone="violet">Prepared</Badge>
            </div>
            <p className="text-sm text-zinc-300">{item}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
