import { notFound } from "next/navigation";
import { getMessages } from 'next-intl/server';
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import CoreProviders from "@/app/providers"; // 1. Import file provider CHUNG
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

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <CoreProviders locale={locale} messages={messages}>
      <main className="min-h-screen w-full">
        {children}
      </main>
    </CoreProviders>
  );
}