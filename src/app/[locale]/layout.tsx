import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import NavbarWrapper from "@/components/NavbarWrapper";
import Navbar from "@/components/Navbar";
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full">
      <NextIntlClientProvider locale={locale}>
        <NavbarWrapper>
          <Navbar />
          {children}
        </NavbarWrapper>
      </NextIntlClientProvider>
    </main>
  );
}
