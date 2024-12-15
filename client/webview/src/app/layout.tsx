import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale }
}: Omit<Props, 'children'>): Promise<Metadata> {

  return {
    // metadataBase: new URL('http://localhost:3000'),
    title: '淘宝客',
    description: '淘宝客',
  };
}

export default function BasicLayout({ children, params: { locale } }: Readonly<Props>) {
  return (
    <html lang={locale}>
      <head>
      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
