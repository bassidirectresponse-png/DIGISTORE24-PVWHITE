import type { CompanyProfile, Project } from "@prisma/client";

export type LegalLang = "fr" | "en" | "es" | "pt" | "de" | "it" | "nl";

const DIGISTORE_BLOCK = {
  name: "Digistore24 GmbH",
  street: "St.-Godehard-Straße 32",
  city: "31139 Hildesheim",
  country: {
    fr: "Allemagne",
    en: "Germany",
    es: "Alemania",
    pt: "Alemanha",
    de: "Deutschland",
    it: "Germania",
    nl: "Duitsland",
  } as Record<LegalLang, string>,
  court: "Amtsgericht Hildesheim — HRB 202956",
  vat: "DE283017717",
  support: "helpdesk@digistore24.com",
  privacy: "datenschutz@digistore24.com",
};

export function formatFullAddress(p: CompanyProfile): string {
  const parts = [
    `${p.addressStreet}, ${p.addressNumber}`,
    p.addressComplement,
    p.addressDistrict,
    p.addressCity,
    p.addressState,
    p.addressZip,
    p.addressCountry,
  ].filter(Boolean);
  return parts.join(" — ");
}

function formatDate(lang: LegalLang): string {
  const d = new Date();
  const locale =
    lang === "fr"
      ? "fr-FR"
      : lang === "es"
        ? "es-ES"
        : lang === "pt"
          ? "pt-PT"
          : lang === "de"
            ? "de-DE"
            : lang === "it"
              ? "it-IT"
              : lang === "nl"
                ? "nl-NL"
                : "en-GB";
  return d.toLocaleDateString(locale);
}

function formatPrice(amount: number, currency: string, lang: LegalLang): string {
  const locale =
    lang === "fr"
      ? "fr-FR"
      : lang === "es"
        ? "es-ES"
        : lang === "pt"
          ? "pt-PT"
          : lang === "de"
            ? "de-DE"
            : lang === "it"
              ? "it-IT"
              : lang === "nl"
                ? "nl-NL"
                : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

// =======================================================================
// Mentions Légales / Legal Notice / Impressum
// =======================================================================

export function legalNotice(lang: LegalLang, p: CompanyProfile): string {
  const addr = formatFullAddress(p);
  const ds = DIGISTORE_BLOCK;
  const dsCountry = ds.country[lang] ?? ds.country.en;

  if (lang === "fr") {
    return `# Mentions Légales

**Éditeur du site / Vendeur du produit**
${p.legalName}
${p.taxIdType}: ${p.taxIdNumber}
Adresse: ${addr}
Email: ${p.contactEmail}
${p.contactPhone ? `Téléphone: ${p.contactPhone}\n` : ""}Représentant légal: ${p.legalRepName}

**Revendeur officiel et partenaire contractuel des clients**
${ds.name}
${ds.street}
${ds.city}, ${dsCountry}
Registergericht: ${ds.court}
TVA UE: ${ds.vat}

Digistore24 GmbH agit comme revendeur officiel pour la vente de ce produit. Le contrat d'achat est conclu entre l'acheteur et Digistore24 GmbH.

**Support client**
Pour toute question concernant votre commande, facturation, livraison ou remboursement, contactez:
${p.supportEmail || p.contactEmail}

**Résolution des litiges en ligne**
La Commission européenne met à disposition une plateforme de règlement en ligne des litiges accessible à l'adresse: https://ec.europa.eu/consumers/odr`;
  }

  if (lang === "es") {
    return `# Aviso Legal

**Editor del sitio / Vendedor del producto**
${p.legalName}
${p.taxIdType}: ${p.taxIdNumber}
Dirección: ${addr}
Email: ${p.contactEmail}
${p.contactPhone ? `Teléfono: ${p.contactPhone}\n` : ""}Representante legal: ${p.legalRepName}

**Revendedor oficial y socio contractual de los clientes**
${ds.name}
${ds.street}
${ds.city}, ${dsCountry}
Tribunal de registro: ${ds.court}
IVA UE: ${ds.vat}

Digistore24 GmbH actúa como revendedor oficial para la venta de este producto. El contrato de compra se celebra entre el comprador y Digistore24 GmbH.

**Atención al cliente**
Para cualquier pregunta sobre su pedido, facturación, entrega o reembolso, contacte:
${p.supportEmail || p.contactEmail}

**Resolución de litigios en línea**
La Comisión Europea pone a disposición una plataforma de resolución de litigios en línea en: https://ec.europa.eu/consumers/odr`;
  }

  if (lang === "pt") {
    return `# Avisos Legais

**Editor do site / Vendedor do produto**
${p.legalName}
${p.taxIdType}: ${p.taxIdNumber}
Endereço: ${addr}
Email: ${p.contactEmail}
${p.contactPhone ? `Telefone: ${p.contactPhone}\n` : ""}Representante legal: ${p.legalRepName}

**Revendedor oficial e parceiro contratual dos clientes**
${ds.name}
${ds.street}
${ds.city}, ${dsCountry}
Tribunal de registo: ${ds.court}
IVA UE: ${ds.vat}

A Digistore24 GmbH atua como revendedora oficial para a venda deste produto. O contrato de compra é celebrado entre o comprador e a Digistore24 GmbH.

**Apoio ao cliente**
Para qualquer questão sobre o seu pedido, faturação, entrega ou reembolso, contacte:
${p.supportEmail || p.contactEmail}

**Resolução de litígios em linha**
A Comissão Europeia disponibiliza uma plataforma de resolução de litígios em linha em: https://ec.europa.eu/consumers/odr`;
  }

  // Default / en / de / it / nl → English (with country label localized)
  return `# Legal Notice

**Site publisher / Product vendor**
${p.legalName}
${p.taxIdType}: ${p.taxIdNumber}
Address: ${addr}
Email: ${p.contactEmail}
${p.contactPhone ? `Phone: ${p.contactPhone}\n` : ""}Legal representative: ${p.legalRepName}

**Official reseller and contractual partner of customers**
${ds.name}
${ds.street}
${ds.city}, ${dsCountry}
Register court: ${ds.court}
EU VAT: ${ds.vat}

Digistore24 GmbH acts as the official reseller for the sale of this product. The purchase contract is concluded between the buyer and Digistore24 GmbH.

**Customer support**
For any questions regarding your order, billing, delivery or refund, contact:
${p.supportEmail || p.contactEmail}

**Online dispute resolution**
The European Commission provides an online dispute resolution platform at: https://ec.europa.eu/consumers/odr`;
}

// =======================================================================
// Privacy Policy / GDPR
// =======================================================================

export function privacyPolicy(lang: LegalLang, p: CompanyProfile): string {
  const addr = formatFullAddress(p);
  const ds = DIGISTORE_BLOCK;
  const dsCountry = ds.country[lang] ?? ds.country.en;
  const date = formatDate(lang);

  if (lang === "fr") {
    return `# Politique de Confidentialité

**Date d'effet:** ${date}

## 1. Introduction
${p.legalName} ("nous", "notre") s'engage à protéger votre vie privée conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679).

## 2. Responsable du traitement
**Pour les données collectées sur ce site:**
${p.legalName}, ${addr}
Email: ${p.contactEmail}

**Pour les données collectées lors de l'achat:**
${ds.name}, ${ds.street}, ${ds.city}, ${dsCountry}
Email: ${ds.privacy}

## 3. Données que nous collectons
- Informations de contact (nom, email) lors de la saisie sur le site
- Données de navigation (IP, type de navigateur, pages visitées) via cookies techniques
- Digistore24 collecte indépendamment les données de paiement lors de l'achat

## 4. Finalités du traitement
- Livraison du produit et communication liée à la commande
- Support client
- Amélioration du site (données anonymisées)
- Marketing par email (uniquement avec votre consentement explicite)

## 5. Base légale
Article 6(1)(b) RGPD (exécution du contrat), Article 6(1)(a) RGPD (consentement), Article 6(1)(f) RGPD (intérêt légitime).

## 6. Partage des données
Nous ne vendons ni ne louons vos données. Partage uniquement avec:
- ${ds.name} (notre revendeur officiel) pour traiter la transaction
- Prestataires email (pour envoi des communications)
- Autorités légales si requis par la loi

## 7. Durée de conservation
Données conservées pendant la durée nécessaire à l'exécution du contrat et aux obligations légales (10 ans pour facturation).

## 8. Vos droits RGPD
Vous disposez des droits suivants: accès, rectification, effacement, limitation, portabilité, opposition. Contactez ${p.contactEmail} pour exercer ces droits.

## 9. Cookies
Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement du site. Vous pouvez les désactiver via votre navigateur.

## 10. Sécurité
Nous appliquons des mesures techniques et organisationnelles pour protéger vos données. Aucune transmission Internet n'est 100% sécurisée.

## 11. Mineurs
Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données de mineurs.

## 12. Contact
${p.legalName} — ${p.contactEmail}`;
  }

  if (lang === "es") {
    return `# Política de Privacidad

**Fecha de efectividad:** ${date}

## 1. Introducción
${p.legalName} ("nosotros") se compromete a proteger su privacidad de acuerdo con el Reglamento General de Protección de Datos (RGPD — UE 2016/679).

## 2. Responsable del tratamiento
**Para los datos recopilados en este sitio:**
${p.legalName}, ${addr}
Email: ${p.contactEmail}

**Para los datos recopilados durante la compra:**
${ds.name}, ${ds.street}, ${ds.city}, ${dsCountry}
Email: ${ds.privacy}

## 3. Datos que recopilamos
- Información de contacto (nombre, email) al introducirla en el sitio
- Datos de navegación (IP, tipo de navegador, páginas visitadas) mediante cookies técnicas
- Digistore24 recopila independientemente los datos de pago durante la compra

## 4. Finalidades del tratamiento
- Entrega del producto y comunicación relacionada con el pedido
- Atención al cliente
- Mejora del sitio (datos anonimizados)
- Marketing por email (solo con su consentimiento explícito)

## 5. Base legal
Artículo 6(1)(b) RGPD (ejecución del contrato), Artículo 6(1)(a) RGPD (consentimiento), Artículo 6(1)(f) RGPD (interés legítimo).

## 6. Compartición de datos
No vendemos ni alquilamos sus datos. Solo los compartimos con:
- ${ds.name} (nuestro revendedor oficial) para procesar la transacción
- Proveedores de email (para envío de comunicaciones)
- Autoridades legales si la ley lo requiere

## 7. Duración de conservación
Los datos se conservan durante el tiempo necesario para ejecutar el contrato y las obligaciones legales (10 años para facturación).

## 8. Sus derechos RGPD
Usted tiene los siguientes derechos: acceso, rectificación, supresión, limitación, portabilidad, oposición. Contacte ${p.contactEmail} para ejercer estos derechos.

## 9. Cookies
Usamos solo cookies técnicas necesarias para el funcionamiento del sitio. Puede desactivarlas desde su navegador.

## 10. Seguridad
Aplicamos medidas técnicas y organizativas para proteger sus datos. Ninguna transmisión por Internet es 100% segura.

## 11. Menores
Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos deliberadamente datos de menores.

## 12. Contacto
${p.legalName} — ${p.contactEmail}`;
  }

  if (lang === "pt") {
    return `# Política de Privacidade

**Data de entrada em vigor:** ${date}

## 1. Introdução
${p.legalName} ("nós") compromete-se a proteger a sua privacidade em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD — UE 2016/679).

## 2. Responsável pelo tratamento
**Para os dados recolhidos neste sítio:**
${p.legalName}, ${addr}
Email: ${p.contactEmail}

**Para os dados recolhidos durante a compra:**
${ds.name}, ${ds.street}, ${ds.city}, ${dsCountry}
Email: ${ds.privacy}

## 3. Dados que recolhemos
- Informação de contacto (nome, email) quando introduzida no sítio
- Dados de navegação (IP, tipo de navegador, páginas visitadas) através de cookies técnicos
- A Digistore24 recolhe independentemente os dados de pagamento durante a compra

## 4. Finalidades do tratamento
- Entrega do produto e comunicação relativa à encomenda
- Apoio ao cliente
- Melhoria do sítio (dados anonimizados)
- Marketing por email (apenas com o seu consentimento explícito)

## 5. Base legal
Artigo 6.º, n.º 1, alínea b) do RGPD (execução do contrato), alínea a) (consentimento), alínea f) (interesse legítimo).

## 6. Partilha de dados
Não vendemos nem alugamos os seus dados. Partilhamos apenas com:
- ${ds.name} (o nosso revendedor oficial) para processar a transação
- Prestadores de email (para envio de comunicações)
- Autoridades legais quando exigido por lei

## 7. Prazo de conservação
Os dados são conservados durante o tempo necessário à execução do contrato e às obrigações legais (10 anos para faturação).

## 8. Os seus direitos RGPD
Tem os seguintes direitos: acesso, retificação, apagamento, limitação, portabilidade, oposição. Contacte ${p.contactEmail} para exercer estes direitos.

## 9. Cookies
Utilizamos apenas cookies técnicos necessários ao funcionamento do sítio. Pode desativá-los através do seu navegador.

## 10. Segurança
Aplicamos medidas técnicas e organizativas para proteger os seus dados. Nenhuma transmissão por Internet é 100% segura.

## 11. Menores
Os nossos serviços não se destinam a menores de 18 anos. Não recolhemos deliberadamente dados de menores.

## 12. Contacto
${p.legalName} — ${p.contactEmail}`;
  }

  // en / de / it / nl → English
  return `# Privacy Policy

**Effective date:** ${date}

## 1. Introduction
${p.legalName} ("we") is committed to protecting your privacy in accordance with the General Data Protection Regulation (GDPR — EU 2016/679).

## 2. Data controller
**For data collected on this site:**
${p.legalName}, ${addr}
Email: ${p.contactEmail}

**For data collected during purchase:**
${ds.name}, ${ds.street}, ${ds.city}, ${dsCountry}
Email: ${ds.privacy}

## 3. Data we collect
- Contact information (name, email) when you submit it on the site
- Browsing data (IP, browser type, pages visited) via technical cookies
- Digistore24 independently collects payment data during the purchase

## 4. Purposes of processing
- Delivery of the product and order-related communication
- Customer support
- Site improvement (anonymized data)
- Email marketing (only with your explicit consent)

## 5. Legal basis
Article 6(1)(b) GDPR (performance of contract), Article 6(1)(a) (consent), Article 6(1)(f) (legitimate interest).

## 6. Data sharing
We do not sell or rent your data. We share only with:
- ${ds.name} (our official reseller) to process the transaction
- Email providers (to send communications)
- Legal authorities if required by law

## 7. Retention period
Data is retained as long as necessary for contract performance and legal obligations (10 years for invoicing).

## 8. Your GDPR rights
You have the following rights: access, rectification, erasure, restriction, portability, objection. Contact ${p.contactEmail} to exercise these rights.

## 9. Cookies
We use only technical cookies necessary for site operation. You can disable them via your browser.

## 10. Security
We apply technical and organizational measures to protect your data. No Internet transmission is 100% secure.

## 11. Minors
Our services are not directed at persons under 18. We do not knowingly collect data from minors.

## 12. Contact
${p.legalName} — ${p.contactEmail}`;
}

// =======================================================================
// Terms of Sale / CGV
// =======================================================================

export function terms(
  lang: LegalLang,
  p: CompanyProfile,
  project: Project
): string {
  const ds = DIGISTORE_BLOCK;
  const date = formatDate(lang);
  const price = formatPrice(project.priceGross, project.currency, lang);

  if (lang === "fr") {
    return `# Conditions Générales de Vente

**Date d'effet:** ${date}

## 1. Acceptation des conditions
En accédant à ce site et en effectuant un achat, vous acceptez ces CGV. Le contrat d'achat est conclu entre vous (l'acheteur) et **${ds.name}**, qui agit comme revendeur officiel.

## 2. Produit
Le produit "${project.productName}" est un produit numérique fourni par ${p.legalName} et revendu par ${ds.name}. Le prix est de ${price} (TVA incluse selon le pays de résidence de l'acheteur).

## 3. Licence d'utilisation
Nous vous accordons une licence limitée, non exclusive et non transférable pour utiliser le produit à des fins personnelles et non commerciales. Il est interdit de:
- Copier, reproduire ou redistribuer le produit
- Le revendre ou l'utiliser à des fins commerciales non autorisées
- Le modifier, le décompiler ou le désassembler

## 4. Paiement
Le paiement est traité par ${ds.name} via des prestataires sécurisés (carte bancaire, PayPal, SEPA, etc.). Digistore24 émet la facture et est responsable de la collecte de la TVA.

## 5. Livraison
Livraison numérique immédiate après confirmation du paiement, par email avec lien d'accès envoyé par Digistore24.

## 6. Droit de rétractation et garantie
Conformément au droit européen de la consommation, vous disposez d'un droit de rétractation de 14 jours. De plus, nous offrons une **garantie satisfait ou remboursé étendue de ${project.guaranteeDays} jours**. Pour demander un remboursement, contactez le support Digistore24 ou écrivez à ${p.supportEmail || p.contactEmail} en précisant votre numéro de commande.

## 7. Propriété intellectuelle
Tout le contenu est protégé par le droit d'auteur. Toute utilisation non autorisée est interdite.

## 8. Limitation de responsabilité
Le produit est fourni "tel quel" sans garantie de résultat spécifique. ${p.legalName} et ${ds.name} déclinent toute responsabilité pour dommages indirects.

## 9. Droit applicable
Pour les achats via ${ds.name}: droit allemand et juridictions allemandes pour les litiges avec les consommateurs européens, sans préjudice des droits impératifs du consommateur dans son pays de résidence.

## 10. Modifications
Nous nous réservons le droit de modifier ces CGV. La version en vigueur au moment de l'achat s'applique.

## 11. Contact
${p.legalName} — ${p.contactEmail}
Support Digistore24: ${ds.support}`;
  }

  if (lang === "es") {
    return `# Condiciones Generales de Venta

**Fecha de efectividad:** ${date}

## 1. Aceptación de las condiciones
Al acceder a este sitio y realizar una compra, usted acepta estas CGV. El contrato de compra se celebra entre usted (el comprador) y **${ds.name}**, que actúa como revendedor oficial.

## 2. Producto
El producto "${project.productName}" es un producto digital proporcionado por ${p.legalName} y revendido por ${ds.name}. El precio es de ${price} (IVA incluido según el país de residencia del comprador).

## 3. Licencia de uso
Le concedemos una licencia limitada, no exclusiva y no transferible para utilizar el producto con fines personales y no comerciales. Queda prohibido:
- Copiar, reproducir o redistribuir el producto
- Revenderlo o utilizarlo con fines comerciales no autorizados
- Modificarlo, descompilarlo o desensamblarlo

## 4. Pago
El pago es procesado por ${ds.name} a través de proveedores seguros (tarjeta bancaria, PayPal, SEPA, etc.). Digistore24 emite la factura y es responsable del cobro del IVA.

## 5. Entrega
Entrega digital inmediata tras la confirmación del pago, por email con enlace de acceso enviado por Digistore24.

## 6. Derecho de desistimiento y garantía
Conforme al derecho europeo del consumidor, usted dispone de un derecho de desistimiento de 14 días. Además, ofrecemos una **garantía de satisfacción ampliada de ${project.guaranteeDays} días**. Para solicitar un reembolso, contacte con el soporte de Digistore24 o escriba a ${p.supportEmail || p.contactEmail} indicando su número de pedido.

## 7. Propiedad intelectual
Todo el contenido está protegido por derechos de autor. Cualquier uso no autorizado está prohibido.

## 8. Limitación de responsabilidad
El producto se ofrece "tal cual" sin garantía de resultado específico. ${p.legalName} y ${ds.name} declinan toda responsabilidad por daños indirectos.

## 9. Derecho aplicable
Para las compras a través de ${ds.name}: derecho alemán y jurisdicción alemana para litigios con consumidores europeos, sin perjuicio de los derechos imperativos del consumidor en su país de residencia.

## 10. Modificaciones
Nos reservamos el derecho de modificar estas CGV. La versión vigente en el momento de la compra es aplicable.

## 11. Contacto
${p.legalName} — ${p.contactEmail}
Soporte Digistore24: ${ds.support}`;
  }

  if (lang === "pt") {
    return `# Condições Gerais de Venda

**Data de entrada em vigor:** ${date}

## 1. Aceitação das condições
Ao aceder a este sítio e efetuar uma compra, aceita estas CGV. O contrato de compra é celebrado entre si (o comprador) e **${ds.name}**, que atua como revendedor oficial.

## 2. Produto
O produto "${project.productName}" é um produto digital fornecido por ${p.legalName} e revendido pela ${ds.name}. O preço é de ${price} (IVA incluído consoante o país de residência do comprador).

## 3. Licença de utilização
Concedemos-lhe uma licença limitada, não exclusiva e intransmissível para utilizar o produto para fins pessoais e não comerciais. É proibido:
- Copiar, reproduzir ou redistribuir o produto
- Revendê-lo ou utilizá-lo para fins comerciais não autorizados
- Modificá-lo, descompilá-lo ou desmontá-lo

## 4. Pagamento
O pagamento é processado pela ${ds.name} através de prestadores seguros (cartão bancário, PayPal, SEPA, etc.). A Digistore24 emite a fatura e é responsável pela cobrança do IVA.

## 5. Entrega
Entrega digital imediata após confirmação do pagamento, por email com ligação de acesso enviada pela Digistore24.

## 6. Direito de retratação e garantia
Nos termos do direito europeu do consumidor, dispõe de um direito de retratação de 14 dias. Adicionalmente, oferecemos uma **garantia de satisfação alargada de ${project.guaranteeDays} dias**. Para solicitar um reembolso, contacte o apoio da Digistore24 ou escreva para ${p.supportEmail || p.contactEmail} indicando o seu número de encomenda.

## 7. Propriedade intelectual
Todo o conteúdo está protegido por direitos de autor. Qualquer utilização não autorizada é proibida.

## 8. Limitação de responsabilidade
O produto é fornecido "tal qual" sem garantia de resultado específico. ${p.legalName} e ${ds.name} declinam qualquer responsabilidade por danos indiretos.

## 9. Direito aplicável
Para as compras através da ${ds.name}: direito alemão e jurisdição alemã para litígios com consumidores europeus, sem prejuízo dos direitos imperativos do consumidor no seu país de residência.

## 10. Alterações
Reservamo-nos o direito de alterar estas CGV. A versão em vigor no momento da compra é aplicável.

## 11. Contacto
${p.legalName} — ${p.contactEmail}
Apoio Digistore24: ${ds.support}`;
  }

  // en / de / it / nl → English
  return `# Terms of Sale

**Effective date:** ${date}

## 1. Acceptance
By accessing this site and making a purchase, you accept these Terms. The purchase contract is concluded between you (the buyer) and **${ds.name}**, acting as the official reseller.

## 2. Product
The product "${project.productName}" is a digital product provided by ${p.legalName} and resold by ${ds.name}. The price is ${price} (VAT included according to the buyer's country of residence).

## 3. License
We grant you a limited, non-exclusive, non-transferable license to use the product for personal, non-commercial purposes. You may not:
- Copy, reproduce or redistribute the product
- Resell it or use it for unauthorized commercial purposes
- Modify, decompile or disassemble it

## 4. Payment
Payment is processed by ${ds.name} via secure providers (card, PayPal, SEPA, etc.). Digistore24 issues the invoice and is responsible for collecting VAT.

## 5. Delivery
Immediate digital delivery upon payment confirmation, by email with access link sent by Digistore24.

## 6. Withdrawal right and guarantee
In accordance with EU consumer law, you have a 14-day right of withdrawal. Additionally, we offer an **extended ${project.guaranteeDays}-day satisfaction guarantee**. To request a refund, contact Digistore24 support or write to ${p.supportEmail || p.contactEmail} quoting your order number.

## 7. Intellectual property
All content is protected by copyright. Any unauthorized use is prohibited.

## 8. Liability limitation
The product is provided "as is" with no guarantee of specific results. ${p.legalName} and ${ds.name} decline all liability for indirect damages.

## 9. Applicable law
For purchases via ${ds.name}: German law and German jurisdiction for disputes with European consumers, without prejudice to mandatory consumer rights in their country of residence.

## 10. Changes
We reserve the right to modify these Terms. The version in force at the time of purchase applies.

## 11. Contact
${p.legalName} — ${p.contactEmail}
Digistore24 support: ${ds.support}`;
}

// =======================================================================
// Refund Policy
// =======================================================================

export function refundPolicy(
  lang: LegalLang,
  p: CompanyProfile,
  project: Project
): string {
  const ds = DIGISTORE_BLOCK;
  const support = p.supportEmail || p.contactEmail;

  if (lang === "fr") {
    return `# Politique de Remboursement

## Garantie ${project.guaranteeDays} jours satisfait ou remboursé

Nous offrons une garantie de remboursement intégral de **${project.guaranteeDays} jours** à compter de la date d'achat.

## Comment demander un remboursement

1. Envoyez un email à ${support} **ou** au support Digistore24 (${ds.support})
2. Indiquez votre numéro de commande Digistore24 (reçu dans votre email de confirmation)
3. La demande doit être faite dans les ${project.guaranteeDays} jours suivant l'achat

## Traitement
${ds.name}, en tant que revendeur officiel, traite tous les remboursements. Le remboursement est effectué sur le même moyen de paiement utilisé lors de l'achat, généralement sous 5-10 jours ouvrés.

## Droit de rétractation légal européen
Indépendamment de cette garantie étendue, vous disposez d'un droit légal de rétractation de 14 jours conformément au droit européen de la consommation.`;
  }

  if (lang === "es") {
    return `# Política de Reembolso

## Garantía de satisfacción de ${project.guaranteeDays} días

Ofrecemos una garantía de reembolso íntegro de **${project.guaranteeDays} días** a partir de la fecha de compra.

## Cómo solicitar un reembolso

1. Envíe un email a ${support} **o** al soporte de Digistore24 (${ds.support})
2. Indique su número de pedido Digistore24 (recibido en su email de confirmación)
3. La solicitud debe hacerse dentro de los ${project.guaranteeDays} días posteriores a la compra

## Tramitación
${ds.name}, como revendedor oficial, tramita todos los reembolsos. El reembolso se realiza al mismo método de pago utilizado en la compra, generalmente en 5-10 días hábiles.

## Derecho legal europeo de desistimiento
Independientemente de esta garantía ampliada, usted dispone de un derecho legal de desistimiento de 14 días conforme al derecho europeo del consumidor.`;
  }

  if (lang === "pt") {
    return `# Política de Reembolso

## Garantia de satisfação de ${project.guaranteeDays} dias

Oferecemos uma garantia de reembolso integral de **${project.guaranteeDays} dias** a contar da data da compra.

## Como pedir um reembolso

1. Envie um email para ${support} **ou** para o apoio da Digistore24 (${ds.support})
2. Indique o seu número de encomenda Digistore24 (recebido no email de confirmação)
3. O pedido deve ser feito dentro dos ${project.guaranteeDays} dias seguintes à compra

## Tratamento
${ds.name}, enquanto revendedor oficial, processa todos os reembolsos. O reembolso é feito no mesmo método de pagamento usado na compra, geralmente em 5-10 dias úteis.

## Direito legal europeu de retratação
Independentemente desta garantia alargada, dispõe de um direito legal de retratação de 14 dias nos termos do direito europeu do consumidor.`;
  }

  return `# Refund Policy

## ${project.guaranteeDays}-day satisfaction guarantee

We offer a full refund guarantee of **${project.guaranteeDays} days** from the date of purchase.

## How to request a refund

1. Send an email to ${support} **or** to Digistore24 support (${ds.support})
2. Include your Digistore24 order number (received in your confirmation email)
3. The request must be made within ${project.guaranteeDays} days of purchase

## Processing
${ds.name}, as the official reseller, processes all refunds. The refund is credited to the same payment method used for the purchase, typically within 5-10 business days.

## EU legal right of withdrawal
Regardless of this extended guarantee, you have a 14-day legal right of withdrawal under European consumer law.`;
}

// =======================================================================
// Medical Disclaimer (wellness, weight_loss, beauty, fitness)
// =======================================================================

export function medicalDisclaimer(lang: LegalLang): string {
  if (lang === "fr") {
    return `# Avertissement Médical Important

**À but éducatif uniquement**
Les informations fournies dans ce produit sont à but éducatif uniquement et ne constituent pas un avis médical. Ce protocole est un guide nutritionnel et de style de vie et n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie ou condition médicale.

**Les résultats individuels peuvent varier**
Les résultats individuels peuvent varier en fonction de nombreux facteurs, notamment l'adhésion au protocole, l'état de santé individuel, la génétique et le mode de vie. Les témoignages partagés sont des expériences individuelles et ne doivent pas être considérés comme des résultats typiques.

**Consultez un professionnel de santé**
Consultez toujours un professionnel de santé qualifié avant de modifier significativement votre alimentation ou votre mode de vie, surtout si vous avez des conditions médicales préexistantes, êtes enceinte ou allaitez.

**Contenu éducatif**
Les résultats peuvent varier d'une personne à l'autre et aucun résultat spécifique n'est garanti.

**Aucune affiliation avec des tiers**
Ce produit n'a aucun lien, relation ou association avec Meta (Facebook/Instagram), Google, ou toute autre plateforme mentionnée ou utilisée pour la publicité.`;
  }

  if (lang === "es") {
    return `# Aviso Médico Importante

**Solo con fines educativos**
La información proporcionada en este producto tiene fines únicamente educativos y no constituye un consejo médico. Este protocolo es una guía nutricional y de estilo de vida y no está destinado a diagnosticar, tratar, curar ni prevenir ninguna enfermedad o condición médica.

**Los resultados individuales pueden variar**
Los resultados individuales pueden variar en función de numerosos factores, incluyendo la adherencia al protocolo, el estado de salud individual, la genética y el estilo de vida. Los testimonios compartidos son experiencias individuales y no deben considerarse como resultados típicos.

**Consulte a un profesional de la salud**
Consulte siempre a un profesional de la salud cualificado antes de modificar significativamente su alimentación o estilo de vida, especialmente si tiene condiciones médicas preexistentes, está embarazada o amamantando.

**Contenido educativo**
Los resultados pueden variar de una persona a otra y ningún resultado específico está garantizado.

**Sin afiliación con terceros**
Este producto no tiene ningún vínculo, relación o asociación con Meta (Facebook/Instagram), Google, o cualquier otra plataforma mencionada o utilizada para publicidad.`;
  }

  if (lang === "pt") {
    return `# Aviso Médico Importante

**Apenas para fins educativos**
As informações fornecidas neste produto destinam-se apenas a fins educativos e não constituem aconselhamento médico. Este protocolo é um guia nutricional e de estilo de vida e não se destina a diagnosticar, tratar, curar ou prevenir qualquer doença ou condição médica.

**Os resultados individuais podem variar**
Os resultados individuais podem variar em função de vários fatores, incluindo a adesão ao protocolo, o estado de saúde individual, a genética e o estilo de vida. Os testemunhos partilhados são experiências individuais e não devem ser considerados resultados típicos.

**Consulte um profissional de saúde**
Consulte sempre um profissional de saúde qualificado antes de modificar significativamente a sua alimentação ou estilo de vida, especialmente se tiver condições médicas preexistentes, estiver grávida ou a amamentar.

**Conteúdo educativo**
Os resultados podem variar de pessoa para pessoa e não é garantido qualquer resultado específico.

**Sem afiliação com terceiros**
Este produto não tem qualquer ligação, relação ou associação com a Meta (Facebook/Instagram), Google, ou qualquer outra plataforma mencionada ou usada para publicidade.`;
  }

  return `# Important Medical Disclaimer

**Educational purposes only**
Information provided in this product is for educational purposes only and does not constitute medical advice. This protocol is a nutritional and lifestyle guide and is not intended to diagnose, treat, cure or prevent any disease or medical condition.

**Individual results may vary**
Individual results may vary depending on many factors including adherence to the protocol, individual health status, genetics and lifestyle. Shared testimonials are individual experiences and should not be considered typical results.

**Consult a healthcare professional**
Always consult a qualified healthcare professional before significantly modifying your diet or lifestyle, especially if you have pre-existing medical conditions, are pregnant or breastfeeding.

**Educational content**
Results may vary from person to person and no specific result is guaranteed.

**No third-party affiliation**
This product has no link, relationship or association with Meta (Facebook/Instagram), Google, or any other platform mentioned or used for advertising.`;
}

// =======================================================================
// Earnings Disclaimer (finance, business)
// =======================================================================

export function earningsDisclaimer(lang: LegalLang): string {
  if (lang === "fr") {
    return `# Avertissement sur les Revenus

**Aucune garantie de revenus**
Les résultats présentés dans ce produit ne sont ni typiques ni garantis. Tout résultat financier dépend de nombreux facteurs individuels: effort, expérience, marché, investissement, chance, et implémentation.

**Les témoignages sont illustratifs**
Les témoignages et études de cas présentés sont des exemples réels mais non représentatifs de la majorité des utilisateurs. Votre succès dépend entièrement de vous.

**Aucun conseil financier**
Ce produit ne constitue pas un conseil financier, fiscal ou juridique. Consultez un conseiller qualifié avant toute décision d'investissement.

**Aucune affiliation**
Ce produit n'a aucun lien avec Meta, Google, ou toute autre plateforme mentionnée.`;
  }

  if (lang === "es") {
    return `# Aviso de Ingresos

**Sin garantía de ingresos**
Los resultados presentados en este producto no son típicos ni están garantizados. Todo resultado financiero depende de numerosos factores individuales: esfuerzo, experiencia, mercado, inversión, suerte e implementación.

**Los testimonios son ilustrativos**
Los testimonios y casos de estudio presentados son ejemplos reales pero no representativos de la mayoría de usuarios. Su éxito depende enteramente de usted.

**Sin asesoramiento financiero**
Este producto no constituye asesoramiento financiero, fiscal ni jurídico. Consulte a un asesor cualificado antes de cualquier decisión de inversión.

**Sin afiliación**
Este producto no tiene ningún vínculo con Meta, Google u otra plataforma mencionada.`;
  }

  if (lang === "pt") {
    return `# Aviso sobre Rendimentos

**Sem garantia de rendimentos**
Os resultados apresentados neste produto não são típicos nem garantidos. Qualquer resultado financeiro depende de vários fatores individuais: esforço, experiência, mercado, investimento, sorte e implementação.

**Os testemunhos são ilustrativos**
Os testemunhos e estudos de caso apresentados são exemplos reais mas não representativos da maioria dos utilizadores. O seu sucesso depende inteiramente de si.

**Sem aconselhamento financeiro**
Este produto não constitui aconselhamento financeiro, fiscal ou jurídico. Consulte um conselheiro qualificado antes de qualquer decisão de investimento.

**Sem afiliação**
Este produto não tem qualquer ligação com a Meta, Google ou outra plataforma mencionada.`;
  }

  return `# Earnings Disclaimer

**No earnings guarantee**
Results presented in this product are neither typical nor guaranteed. Any financial outcome depends on many individual factors: effort, experience, market, investment, luck and implementation.

**Testimonials are illustrative**
Testimonials and case studies shown are real examples but not representative of the majority of users. Your success depends entirely on you.

**No financial advice**
This product does not constitute financial, tax or legal advice. Consult a qualified advisor before any investment decision.

**No affiliation**
This product has no link with Meta, Google or any other platform mentioned.`;
}

// =======================================================================
// Aggregator
// =======================================================================

export interface LegalTexts {
  mentionsLegales: string;
  privacyPolicy: string;
  terms: string;
  refundPolicy: string;
  medicalDisclaimer?: string;
  earningsDisclaimer?: string;
}

const MEDICAL_NICHES = new Set(["wellness", "weight_loss", "beauty", "fitness"]);
const EARNINGS_NICHES = new Set(["finance", "business"]);

export function buildLegalTexts(
  project: Project,
  profile: CompanyProfile
): LegalTexts {
  const lang = (project.language as LegalLang) ?? "en";
  const texts: LegalTexts = {
    mentionsLegales: legalNotice(lang, profile),
    privacyPolicy: privacyPolicy(lang, profile),
    terms: terms(lang, profile, project),
    refundPolicy: refundPolicy(lang, profile, project),
  };
  if (MEDICAL_NICHES.has(project.niche)) {
    texts.medicalDisclaimer = medicalDisclaimer(lang);
  }
  if (EARNINGS_NICHES.has(project.niche)) {
    texts.earningsDisclaimer = earningsDisclaimer(lang);
  }
  return texts;
}
