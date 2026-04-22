import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-lg tracking-tight">
            Digistore <span className="text-indigo-600">Forge</span>
          </Link>
        </div>
        <div className="rounded-xl border bg-white/90 backdrop-blur p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Criar conta</h1>
          <p className="text-sm text-slate-600 mb-6">
            Crie sua conta para começar a gerar sales pages.
          </p>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-slate-600">
            Já tem conta?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
