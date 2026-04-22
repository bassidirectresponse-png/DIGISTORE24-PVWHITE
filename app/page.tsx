import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, Globe } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <header className="flex items-center justify-between mb-24">
          <div className="font-bold text-lg tracking-tight">
            Digistore <span className="text-indigo-600">Forge</span>
          </div>
          <nav className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Criar conta</Link>
            </Button>
          </nav>
        </header>

        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 backdrop-blur mb-6">
            Digistore24 GmbH Ready
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Sales pages que passam na aprovação
            <span className="block text-indigo-600">na primeira submissão.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Preencha os dados da sua empresa uma vez. Para cada novo produto,
            gere uma sales page HTML single-file com copy profissional,
            Mentions Légales, CGV, Politique de Confidentialité e Refund Policy
            alinhadas aos critérios Digistore24 GmbH.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Começar agora <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="rounded-xl bg-white/70 backdrop-blur border p-6">
            <Shield className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold mb-2">Compliance GDPR</h3>
            <p className="text-sm text-slate-600">
              Mentions Légales, Politique de Confidentialité e CGV geradas
              automaticamente com os dados da Digistore24 como reseller
              oficial.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 backdrop-blur border p-6">
            <Sparkles className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold mb-2">Copy profissional</h3>
            <p className="text-sm text-slate-600">
              Claude Sonnet 4 com system prompt especializado em critérios de
              aprovação. Zero claims absolutos, tom empático, testimonials com
              disclaimers.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 backdrop-blur border p-6">
            <Globe className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold mb-2">7 idiomas</h3>
            <p className="text-sm text-slate-600">
              FR, EN, ES, PT, DE, IT, NL — todos os blocos legais adaptados
              por idioma. Publica em Netlify com um clique.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
