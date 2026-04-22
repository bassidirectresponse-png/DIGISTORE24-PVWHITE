"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { CompanyProfileSchema, type CompanyProfileInput } from "@/lib/schemas";
import { saveCompanyProfileAction } from "@/app/(app)/profile/actions";

interface Props {
  initial?: Partial<CompanyProfileInput>;
}

const DEFAULTS: CompanyProfileInput = {
  legalName: "",
  tradingName: "",
  taxIdType: "CNPJ",
  taxIdNumber: "",
  vatNumber: "",
  addressStreet: "",
  addressNumber: "",
  addressComplement: "",
  addressDistrict: "",
  addressCity: "",
  addressState: "",
  addressZip: "",
  addressCountry: "Brasil",
  contactEmail: "",
  contactPhone: "",
  supportEmail: "",
  legalRepName: "",
};

export function CompanyProfileForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(CompanyProfileSchema),
    defaultValues: { ...DEFAULTS, ...initial },
  });

  const taxIdType = form.watch("taxIdType");

  const onSubmit = (values: CompanyProfileInput) => {
    startTransition(async () => {
      const result = await saveCompanyProfileAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Empresa salva!");
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Section title="Identificação da empresa">
        <Row>
          <Field label="Razão social" required>
            <Input {...form.register("legalName")} placeholder="Vanguard Group Ltda" />
            <Err msg={form.formState.errors.legalName?.message} />
          </Field>
          <Field label="Nome fantasia">
            <Input {...form.register("tradingName")} />
          </Field>
        </Row>
        <Row>
          <Field label="Tipo de identificação fiscal" required>
            <Select
              value={taxIdType}
              onValueChange={(v) =>
                form.setValue("taxIdType", v as CompanyProfileInput["taxIdType"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="SIRET">SIRET</SelectItem>
                <SelectItem value="VAT_EU">VAT EU</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Número" required>
            <Input {...form.register("taxIdNumber")} />
            <Err msg={form.formState.errors.taxIdNumber?.message} />
          </Field>
        </Row>
        <Row>
          <Field label="VAT EU (se aplicável)">
            <Input {...form.register("vatNumber")} placeholder="FR12345678901" />
          </Field>
        </Row>
      </Section>

      <Section title="Endereço">
        <Row>
          <Field label="Rua / Avenue" required>
            <Input {...form.register("addressStreet")} />
            <Err msg={form.formState.errors.addressStreet?.message} />
          </Field>
          <Field label="Número" required>
            <Input {...form.register("addressNumber")} />
            <Err msg={form.formState.errors.addressNumber?.message} />
          </Field>
        </Row>
        <Row>
          <Field label="Complemento">
            <Input {...form.register("addressComplement")} placeholder="Loja, Apto, Andar" />
          </Field>
          <Field label="Bairro" required>
            <Input {...form.register("addressDistrict")} />
            <Err msg={form.formState.errors.addressDistrict?.message} />
          </Field>
        </Row>
        <Row>
          <Field label="Cidade" required>
            <Input {...form.register("addressCity")} />
            <Err msg={form.formState.errors.addressCity?.message} />
          </Field>
          <Field label="Estado / Região">
            <Input {...form.register("addressState")} />
          </Field>
        </Row>
        <Row>
          <Field label="CEP / Código postal" required>
            <Input {...form.register("addressZip")} />
            <Err msg={form.formState.errors.addressZip?.message} />
          </Field>
          <Field label="País" required>
            <Input {...form.register("addressCountry")} />
            <Err msg={form.formState.errors.addressCountry?.message} />
          </Field>
        </Row>
      </Section>

      <Section title="Contato">
        <Row>
          <Field label="Email principal" required>
            <Input type="email" {...form.register("contactEmail")} />
            <Err msg={form.formState.errors.contactEmail?.message} />
          </Field>
          <Field label="Telefone (com DDI)">
            <Input {...form.register("contactPhone")} placeholder="+55 32 99999-0000" />
          </Field>
        </Row>
        <Row>
          <Field label="Email de suporte (se diferente)">
            <Input type="email" {...form.register("supportEmail")} />
            <Err msg={form.formState.errors.supportEmail?.message} />
          </Field>
        </Row>
      </Section>

      <Section title="Representante legal">
        <Row>
          <Field label="Nome completo do representante legal" required>
            <Input {...form.register("legalRepName")} />
            <Err msg={form.formState.errors.legalRepName?.message} />
          </Field>
        </Row>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Salvar
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold text-slate-900 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600">{msg}</p>;
}
