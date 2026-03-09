import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { saveCurrentUser } from "@/services/access-control";
import { signInWithApiProfile } from "@/services/crm-api";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!form.email.trim()) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const user = await signInWithApiProfile(form.email);
      saveCurrentUser(user);
      navigate("/", { replace: true });
      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao entrar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-500/14 blur-[120px]" />
        <div className="absolute right-[-5%] top-[12%] h-[380px] w-[380px] rounded-full bg-violet-500/12 blur-[140px]" />
        <div className="absolute bottom-[-18%] left-[28%] h-[380px] w-[380px] rounded-full bg-emerald-400/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full items-center gap-8 xl:grid-cols-[0.8fr_0.72fr]">
          <div className="flex justify-center xl:justify-start">
            <img
              src="/logo.png"
              alt="Responsyva"
              className="h-32 w-auto object-contain drop-shadow-[0_0_40px_rgba(52,211,153,0.18)] xl:h-40"
            />
          </div>

          <Card className="border-white/10 p-0">
            <div className="border-b border-white/10 px-8 py-8">
              <h2 className="text-3xl font-semibold text-white">Entrar</h2>
            </div>

            <div className="space-y-5 px-8 py-8">
              <div className="space-y-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Email</span>
                  <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                    <Mail className="size-4 text-zinc-500" />
                    <input
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                      placeholder="voce@responsyva.ai"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Senha</span>
                  <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                    <LockKeyhole className="size-4 text-zinc-500" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                      placeholder="••••••••"
                    />
                  </div>
                </label>
              </div>

              <Button className="w-full gap-2 py-6 text-base" onClick={handleLogin}>
                {isLoading ? "Entrando..." : "Entrar no workspace"}
                <ArrowRight className="size-4" />
              </Button>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
