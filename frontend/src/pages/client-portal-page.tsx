import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";

export function ClientPortalPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/70">Responsyva Client Portal</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Proposta e contrato digital</h1>
      </div>
      <Card className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">Nenhuma proposta publicada</p>
              <p className="text-sm text-zinc-400">Publique uma proposta para liberar o portal do cliente.</p>
            </div>
            <Badge tone="slate">Aguardando</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Setup</p>
              <p className="mt-2 text-2xl font-semibold text-white">R$ 0</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Mensalidade</p>
              <p className="mt-2 text-2xl font-semibold text-white">R$ 0</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Status</p>
              <p className="mt-2 text-2xl font-semibold text-white">Sem dados</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 text-sm text-zinc-300">
            Nenhum escopo publicado no portal até o momento.
          </div>
        </div>
        <div className="space-y-3">
          <Button className="w-full">Aprovar proposta</Button>
          <Button variant="secondary" className="w-full">
            Pedir ajuste
          </Button>
          <Button variant="secondary" className="w-full">
            Reprovar proposta
          </Button>
          <Button variant="ghost" className="w-full">
            Assinar contrato digitalmente
          </Button>
          <Button variant="ghost" className="w-full">
            Baixar PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
