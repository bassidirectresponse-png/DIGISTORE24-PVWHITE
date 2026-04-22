import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompanyProfileForm } from "@/components/app/CompanyProfileForm";
import type { CompanyProfileInput } from "@/lib/schemas";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { first?: string };
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId } });
  const isFirst = searchParams.first === "1" || !profile;

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Perfil da empresa</h1>
        {isFirst ? (
          <p className="text-slate-600 mt-2">
            Preencha os dados uma vez — eles serão usados automaticamente nas
            Mentions Légales, Politique de Confidentialité, CGV e Refund Policy
            de todas as páginas que você gerar.
          </p>
        ) : (
          <p className="text-slate-600 mt-2">
            Atualize os dados da sua empresa.
          </p>
        )}
      </header>

      <CompanyProfileForm
        initial={
          profile
            ? {
                legalName: profile.legalName,
                tradingName: profile.tradingName ?? "",
                taxIdType: profile.taxIdType as CompanyProfileInput["taxIdType"],
                taxIdNumber: profile.taxIdNumber,
                vatNumber: profile.vatNumber ?? "",
                addressStreet: profile.addressStreet,
                addressNumber: profile.addressNumber,
                addressComplement: profile.addressComplement ?? "",
                addressDistrict: profile.addressDistrict,
                addressCity: profile.addressCity,
                addressState: profile.addressState ?? "",
                addressZip: profile.addressZip,
                addressCountry: profile.addressCountry,
                contactEmail: profile.contactEmail,
                contactPhone: profile.contactPhone ?? "",
                supportEmail: profile.supportEmail ?? "",
                legalRepName: profile.legalRepName,
              }
            : undefined
        }
      />
    </div>
  );
}
