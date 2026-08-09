import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIG-Drainase Bobong | Dinas PUPR Pulau Taliabu",
  description: "Sistem Informasi Geografis Pemetaan Drainase Kota Bobong, Dinas PUPR Pulau Taliabu",
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

