import * as Dialog from "@radix-ui/react-dialog";
import { Bot, Clock3, Sparkles } from "lucide-react";
import { Card } from "@/components/shared/card";

export function AiFab() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-6 right-6 z-40 flex h-16 items-center gap-3 rounded-full border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(52,211,153,0.22),rgba(139,92,246,0.24))] px-5 text-white shadow-[0_0_40px_rgba(52,211,153,0.18)] backdrop-blur-xl transition-transform hover:scale-[1.02]">
          <span className="flex size-10 items-center justify-center rounded-full bg-black/35">
            <Bot className="size-5" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold">Copiloto Responsyva</span>
            <span className="block text-xs text-zinc-300">Em breve</span>
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-[460px] outline-none">
          <Card className="border-emerald-400/20">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                <Sparkles className="size-4" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-white">Assistente global de IA</Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-400">Funcionalidade em standby.</Dialog.Description>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/8 bg-black/20 p-5 text-center">
              <p className="text-xs uppercase tracking-[0.26em] text-emerald-300/70">Em breve</p>
              <p className="mt-3 text-lg font-semibold text-white">O chat com IA ainda não está disponível.</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Essa área será ativada em uma próxima entrega com o modelo integrado ao CRM e consultas em tempo real.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                <Clock3 className="size-4 text-emerald-300" />
                Modo standby
              </div>
            </div>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
