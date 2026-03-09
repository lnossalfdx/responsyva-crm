import { Bot, Clock3, Sparkles } from "lucide-react";
import { Card } from "@/components/shared/card";

export function AiCenterPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-0 flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 px-6 py-5 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/70">AI Control Layer</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Central de IA</h1>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-8 lg:px-8">
        <Card className="w-full max-w-3xl border-emerald-400/15 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            <Sparkles className="size-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.32em] text-emerald-300/70">Standby</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Módulo em breve</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            A conversa com a IA ainda não está no ar. Essa área será conectada em breve ao modelo para consultas operacionais do CRM.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
            <Clock3 className="size-4 text-emerald-300" />
            Disponível em uma próxima atualização
          </div>
        </Card>
      </div>
    </div>
  );
}
