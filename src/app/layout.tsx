import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SI-PAJA Pulau Taliabu | Dinas PUPR",
  description: "Sistem Informasi Pemetaan dan Analisa Jaringan Drainase Terintegrasi di Pulau Taliabu - Dinas Pekerjaan Umum dan Penataan Ruang",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}

