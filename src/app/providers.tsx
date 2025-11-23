"use client"; // Bắt buộc

import { AuthProvider } from '@/app/context/AuthContext';
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from 'next-intl';
import { Toaster as HotToaster } from "react-hot-toast"; 
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; 
import { SidebarProvider } from "@/components/ui/sidebar"; 

type Props = {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

// File này chứa CÁC PROVIDER CHUNG
export default function CoreProviders({ children, locale, messages }: Props) {
  return (
      <AuthProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SidebarProvider>
            <HotToaster />
            <SonnerToaster richColors position="top-right" />
            {children}
          </SidebarProvider>
        </NextIntlClientProvider>
      </AuthProvider>
  );
}